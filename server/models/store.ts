import { ResultSetHeader } from "mysql2";
import { z } from "zod";
import pool from "./dbPool.js";

function instanceOfSetHeader(object: any): object is ResultSetHeader {
  return "insertId" in object;
}

export const createStore = async (store: {
  name: number;
  city: string;
  district: string;
}) => {
  try {
    const { name, city, district } = store;
    const results = await pool.query(
      `
            INSERT INTO store (name, city, district)
            VALUES(?, ?, ?)
          `,
      [name, city, district]
    );
    if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
      return results[0].insertId;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
};

const storeSchema = z.object({
  id: z.number(),
  name: z.string(),
  city: z.string(),
  district: z.string(),
  create_at: z.date(),
});

export const findStore = async (storeId: number) => {
  const result = await pool.query(`SELECT * FROM store WHERE id = ?;`, [
    storeId,
  ]);

  const stores = z.array(storeSchema).parse(result[0]);
  return stores;
};
export const findStores = async () => {
  const result = await pool.query(`SELECT * FROM store;`);

  const stores = z.array(storeSchema).parse(result[0]);
  return stores;
};

export const findUserStore = async (userId: number) => {
  const result = await pool.query(
    `
        SELECT store.id id, store.name, store.city, store.district, store.create_at
        FROM store INNER JOIN user_roles as ur ON store.id = ur.store_id
        WHERE ur.user_id = ?;
    `,
    [userId]
  );

  const stores = z.array(storeSchema).parse(result[0]);
  return stores;
};

const storeStaffShema = z.object({
  user_id: z.number(),
  user_name: z.string(),
  role_name: z.string(),
});

export const findStoreStaff = async (storeId: number) => {
  const result = await pool.query(
    `
        SELECT users.id user_id, users.name user_name, roles.name role_name
        FROM user_roles
        INNER JOIN users ON user_roles.user_id = users.id
        INNER JOIN roles ON user_roles.role_id = roles.id
        WHERE user_roles.store_id = ?
    `,
    [storeId]
  );
  const staff = z.array(storeStaffShema).parse(result[0]);

  return staff;
};
