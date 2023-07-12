import pool from "./dbPool.js";
import { z } from "zod";

export const ADMIN_ROLE = 1;

const UserRolesShema = z.object({
  user_id: z.number(),
  role_id: z.number(),
  store_id: z.number(),
});

export const findUserRoles = async (userId: number) => {
  const result = await pool.query(
    `SELECT user_id, role_id, store_id FROM user_roles WHERE user_id = ?`,
    [userId]
  );
  const userRoles = z.array(UserRolesShema).parse(result[0]);
  return userRoles;
};

export const findAdminUser = async (storeId: number) => {
  const result = await pool.query(
    `SELECT user_id, role_id, store_id FROM user_roles WHERE store_id = ? AND role_id = ?`,
    [storeId, ADMIN_ROLE]
  );
  const adminUser = z.array(UserRolesShema).parse(result[0]);
  return adminUser[0];
};

type UserRoles = z.infer<typeof UserRolesShema>;

export function groupRolesWithStoreId(userRoles: UserRoles[]) {
  const result = userRoles.reduce(function (
    obj: {
      [storeId: string]: number[];
    },
    userRole
  ) {
    if (!obj[userRole.store_id]) {
      obj[userRole.store_id] = [];
    }
    obj[userRole.store_id].push(userRole.role_id);
    return obj;
  }, {});
  return result;
}

const UserRolesWithTimestampSchema = z.object({
  user_id: z.number(),
  role_id: z.number(),
  store_id: z.number(),
  create_at: z.date(),
  update_at: z.date(),
});

export const findUserRolesWithTimestamp = async (
  userId: number,
  storeId: number
) => {
  const result = await pool.query(
    "SELECT * FROM user_roles WHERE user_id = ? AND store_id = ?",
    [userId, storeId]
  );
  const userRolesWithTimestamp = z
    .array(UserRolesWithTimestampSchema)
    .parse(result[0]);
  return userRolesWithTimestamp;
};

export const addRoleToUser = async (
  userId: number,
  storeId: number,
  roleId: number[]
) => {
  const insertArr = roleId.map((ele) => [userId, storeId, ele]);
  await pool.query(
    `INSERT INTO user_roles (user_id, store_id, role_id) VALUES ?`,
    [insertArr]
  );
};

export const addStoreAdmin = async (userId: number, storeId: number) => {
  await pool.query(
    `INSERT INTO user_roles (user_id, store_id, role_id) VALUES (?, ?, ?)`,
    [userId, storeId, ADMIN_ROLE]
  );
};

export const updateUserRole = async (
  userId: number,
  storeId: number,
  roleId: number
) => {
  await pool.query(
    `UPDATE user_roles SET role_id = ? WHERE user_id = ? AND store_id = ?`,
    [roleId, userId, storeId]
  );
};

export const deleteUserRoles = async (userId: number, storeId: number) => {
  await pool.query(
    `DELETE FROM user_roles WHERE user_id = ? AND store_id = ?`,
    [userId, storeId]
  );
};
