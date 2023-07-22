import { Connection } from "mysql2/promise";
import { z } from "zod";
import pool from "./dbPool.js";

/**
  id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY
  product_id bigint unsigned NOT NULL FOREIGN KEY
  kind varchar(127) NOT NULL
  size enum NOT NULL
  price int unsigned NOT NULL
*/

export const createProductVariants = async (
  variantData: {
    productId: number;
    kind: string;
    stock: number;
    price: number;
  }[]
) => {
  try {
    await pool.query(
      `
        INSERT INTO product_variants (product_id, kind, stock, price)
        VALUES ?
      `,
      [
        variantData.map((data) => {
          const { productId, kind, stock, price } = data;
          return [productId, kind, stock, price];
        }),
      ]
    );
  } catch (err) {
    console.error(err);
    return null;
  }
};

const ProductVariantSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  kind: z.string(),
  stock: z.number(),
  price: z.number(),
});

type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const getProductVariantsByProductId = async (productIds: number[]) => {
  if (productIds.length === 0) return [];
  const result = await pool.query(
    `
    SELECT id, product_id, kind, stock, price
    FROM product_variants
    WHERE product_id IN (?)
  `,
    [productIds]
  );
  const productVariants = z.array(ProductVariantSchema).parse(result[0]);
  return productVariants;
};

export const getProductVariantsById = async (varaintIds: number[]) => {
  if (varaintIds.length === 0) return [];
  const result = await pool.query(
    `
    SELECT id, product_id, kind, stock, price
    FROM product_variants
    WHERE id IN (?)
  `,
    [varaintIds]
  );
  const productVariants = z.array(ProductVariantSchema).parse(result[0]);
  return productVariants;
};

export const getProductVariantsByProductVariantIds = async (
  productIds: number[],
  varaintIds: number[]
) => {
  if (varaintIds.length === 0) return [];
  const result = await pool.query(
    `
    SELECT id, product_id, kind, stock, price
    FROM product_variants
    WHERE product_id IN (?) AND id IN (?)
  `,
    [productIds, varaintIds]
  );
  const productVariants = z.array(ProductVariantSchema).parse(result[0]);
  return productVariants;
};

export const groupVariants = (productVariants: ProductVariant[]) => {
  const result = productVariants.reduce(
    (
      obj: {
        [productId: string]: {
          variants: {
            variantId: number;
            kind: string;
            stock: number;
            price: number;
          }[];
        };
      },
      variant
    ) => {
      if (!obj[variant.product_id]) {
        obj[variant.product_id] = {
          variants: [],
        };
      }
      obj[variant.product_id].variants.push({
        variantId: variant.id,
        kind: variant.kind,
        stock: variant.stock,
        price: variant.price,
      });
      return obj;
    },
    {}
  );
  return result;
};

const VariantStockSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  stock: z.number(),
});

export const getVariantsStockWithLock = async (
  variantIds: number[],
  connection: Connection
) => {
  const result = await connection.query(
    `
    SELECT id, product_id, stock FROM product_variants
    WHERE id IN (?)
    FOR UPDATE;
  `,
    [variantIds]
  );
  const productVariants = z.array(VariantStockSchema).parse(result[0]);
  return productVariants;
};

export const updateVariantsStock = async (
  variants: { id: number; stock: number }[],
  connection: Connection
) => {
  await connection.query(
    `
      UPDATE product_variants SET stock = (
        CASE id
        ${variants
          .map((variant) => `WHEN ${variant.id} THEN ${variant.stock}`)
          .join(" ")}
        END
      )
      WHERE id IN (?)
    `,
    [variants.map(({ id }) => id)]
  );
};
