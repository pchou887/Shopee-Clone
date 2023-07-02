import { ResultSetHeader } from "mysql2";
import { z } from "zod";
import pool from "./dbPool.js";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  store_id bigint unsigned NOT NULL
  category enum
  name varchar(255) NOT NULL
  description varchar(255) NOT NULL
  variants
  images
**/

export const CategorySchema = z.enum([
  "video_game_peripherals",
  "clothes",
  "shoes",
]);

const ProductSchema = z.object({
  id: z.number(),
  store_id: z.number(),
  category: CategorySchema,
  name: z.string(),
  description: z.string(),
});

export const PAGE_COUNT = 10;
export async function getProducts({
  paging = 0,
  category,
}: {
  paging: number;
  category: string;
}) {
  const results = await pool.query(
    `
    SELECT id, store_id, category, name, description FROM products
    ${
      CategorySchema.safeParse(category).success
        ? `WHERE category = "${category}"`
        : ""
    }
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `,
    [PAGE_COUNT, paging * PAGE_COUNT]
  );
  const products = z.array(ProductSchema).parse(results[0]);
  return products;
}

export async function getProduct(id: number) {
  const results = await pool.query(
    `
    SELECT id, store_id, category, name, description FROM products
    WHERE id = ?
  `,
    [id]
  );
  const products = z.array(ProductSchema).parse(results[0]);
  return products;
}

export async function searchProducts({
  paging = 0,
  keyword,
}: {
  paging: number;
  keyword: string;
}) {
  const results = await pool.query(
    `
    SELECT id, store_id, category, name, description FROM products
    WHERE name LIKE ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `,
    [`%${keyword}%`, PAGE_COUNT, paging * PAGE_COUNT]
  );
  const products = z.array(ProductSchema).parse(results[0]);
  return products;
}

const ProductCountSchema = z.object({
  count: z.number(),
});

type ProductCount = z.infer<typeof ProductCountSchema>;

function instanceOfProductCount(object: any): object is ProductCount {
  return "count" in object;
}

export async function countProducts({
  category,
  keyword,
}: {
  category?: string;
  keyword?: string;
}) {
  const results = await pool.query(
    `
  SELECT COUNT(id) AS count
  FROM products
  ${
    CategorySchema.safeParse(category).success
      ? `WHERE category = "${category}"`
      : ""
  }
  ${typeof keyword === "string" ? `WHERE name LIKE ?` : ""}
`,
    [`%${keyword}%`]
  );
  if (Array.isArray(results[0]) && instanceOfProductCount(results[0][0])) {
    const productCount = ProductCountSchema.parse(results[0][0]);
    return productCount.count;
  }
  return 0;
}

export async function countStoreProducts({ storeId }: { storeId: number }) {
  const results = await pool.query(
    `SELECT COUNT(id) AS count FROM products WHERE store_id = ?`,
    [storeId]
  );
  if (Array.isArray(results[0]) && instanceOfProductCount(results[0][0])) {
    const productCount = ProductCountSchema.parse(results[0][0]);
    return productCount.count;
  }
  return 0;
}

function instanceOfSetHeader(object: any): object is ResultSetHeader {
  return "insertId" in object;
}

export async function createProduct(productData: {
  store_id: number;
  category: string;
  name: string;
  description: string;
}) {
  try {
    const { store_id, category, name, description } = productData;
    const results = await pool.query(
      `
        INSERT INTO products (store_id, category, name, description)
        VALUES(?, ?, ?, ?)
      `,
      [store_id, category, name, description]
    );
    if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
      return results[0].insertId;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function isProductExist(productId: number) {
  const results = await pool.query(
    `
    SELECT COUNT(id) AS count FROM products
    WHERE id = ?
  `,
    [productId]
  );
  if (Array.isArray(results[0]) && instanceOfProductCount(results[0][0])) {
    const productCount = ProductCountSchema.parse(results[0][0]);
    return productCount.count === 1;
  }
  return false;
}

const PartialProductSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export async function getProductsByIds(ids: number[]) {
  const results = await pool.query(
    `
    SELECT id, name FROM products
    WHERE id IN (?)
  `,
    [ids]
  );
  const products = z.array(PartialProductSchema).parse(results[0]);
  return products;
}

export const updateProduct = async (productData: {
  id: number;
  storeId: number;
  category: string;
  name: string;
  description: string;
}) => {
  const { id, storeId, category, name, description } = productData;
  await pool.query(
    `
    UPDATE products SET category = ?, name = ?, description = ?
    WHERE id = ? AND store_id = ?
  `,
    [category, name, description, id, storeId]
  );
};

export async function getStoreProducts({
  paging = 0,
  storeId,
}: {
  paging: number;
  storeId: number;
}) {
  const results = await pool.query(
    `
    SELECT id, store_id, category, name, description FROM products
    WHERE store_id = ?
    ORDER BY id DESC
    LIMIT ? OFFSET ?
  `,
    [storeId, PAGE_COUNT, paging * PAGE_COUNT]
  );
  const products = z.array(ProductSchema).parse(results[0]);
  return products;
}
