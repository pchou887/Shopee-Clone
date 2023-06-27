import { z } from "zod";
import pool from "./dbPool.js";

/**
  id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
  product_id bigint unsigned NOT NULL FOREIGN KEY
  path varchar(255) NOT NULL
  type varchar(255) NOT NULL
  size int unsigned NOT NULL
  mimetype varchar(127) NOT NULL
*/

export async function createProductImages(
  imageData: {
    productId: number;
    path: string;
    type: string;
    size: number;
    mimetype: string;
  }[]
) {
  try {
    await pool.query(
      `
        INSERT INTO product_images (product_id, path, type, size, mimetype)
        VALUES ?
      `,
      [
        imageData.map((data) => {
          const { productId, path, type, size, mimetype } = data;
          return [productId, path, type, size, mimetype];
        }),
      ]
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}

const ProductImageSchema = z.object({
  product_id: z.number(),
  path: z.string(),
  type: z.string(),
  mimetype: z.string(),
});

type ProductImage = z.infer<typeof ProductImageSchema>;

export async function getProductImages(productIds: number[]) {
  if (productIds.length === 0) return [];
  const result = await pool.query(
    `
    SELECT product_id, path, type, mimetype
    FROM product_images
    WHERE product_id IN (?)
  `,
    [productIds]
  );
  const productImages = z.array(ProductImageSchema).parse(result[0]);
  return productImages;
}

export function groupImages(productImages: ProductImage[]) {
  const result = productImages.reduce(function (
    obj: {
      [productId: string]: {
        main_image: string;
        images: string[];
      };
    },
    image
  ) {
    if (!obj[image.product_id]) {
      obj[image.product_id] = { main_image: "", images: [] };
    }
    if (image.type === "main_image") {
      obj[image.product_id].main_image = image.path;
    }
    if (image.type === "images") {
      obj[image.product_id].images.push(image.path);
    }
    return obj;
  }, {});
  return result;
}
