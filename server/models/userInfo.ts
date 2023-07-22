import { Connection } from "mysql2/promise";
import { z } from "zod";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";
import pool from "./dbPool.js";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  order_id bigint unsigned NOT NULL FOREIGN KEY
  name
  phone
  address
**/

export const createUserInfo = async (
  userId: number,
  recipient: {
    name: string;
    phone: string;
    email: string;
    address: string;
  },
  connection: Connection
) => {
  const { name, email, address, phone } = recipient;
  const results = await connection.query(
    `
    INSERT INTO user_info (
      user_id, name, email, address, phone
    )
    VALUES(?, ?, ?, ?, ?)
  `,
    [userId, name, email, address, phone]
  );
  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return results[0].insertId;
  }
  throw new Error("create campaign failed");
};

const userInfoSchema = z.object({
  name: z.string(),
  email: z.string(),
  address: z.string(),
  phone: z.string(),
});
export const findUserInfo = async (userId: number) => {
  const results = await pool.query(
    `SELECT (name, email, address, phone) FROM user_info WHERE user_id = ?`,
    [userId]
  );
  const userInfo = z.array(userInfoSchema).parse(results[0]);
  return userInfo;
};
