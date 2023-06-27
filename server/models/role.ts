import pool from "./dbPool.js";
import { z } from "zod";

const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});

export const findUserNotOwnedRoles = async (
  userId: number,
  storeId: number
) => {
  const result = await pool.query(
    `
      SELECT * FROM roles
      WHERE id NOT IN
      (SELECT role_id FROM user_roles WHERE user_id = ? AND store_id = ?);
    `,
    [userId, storeId]
  );
  const roles = z.array(roleSchema).parse(result[0]);

  return roles;
};
