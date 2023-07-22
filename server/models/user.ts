import { z } from "zod";
import pool from "./dbPool.js";
import instanceOfSetHeader from "../utils/instanceOfSetHeader.js";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  email varchar(127) NOT NULL UNIQUE
  name varchar(127) NOT NULL
  picture varchar(255)
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  providers
**/

export const createUser = async (email: string, name: string) => {
  const results = await pool.query(
    `
    INSERT INTO users (email, name)
    VALUES(?, ?)
  `,
    [email, name]
  );
  if (Array.isArray(results) && instanceOfSetHeader(results[0])) {
    return results[0].insertId;
  }
  throw new Error("create user failed");
};

const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  picture: z.string(),
});

export const findUser = async (email: string) => {
  const results = await pool.query(
    `
    SELECT * FROM users
    WHERE email = ?
  `,
    [email]
  );
  const users = z.array(UserSchema).parse(results[0]);
  return users[0];
};

export const findUserById = async (id: number) => {
  const results = await pool.query(
    `
    SELECT * FROM users
    WHERE id = ?
  `,
    [id]
  );
  const users = z.array(UserSchema).parse(results[0]);
  return users[0];
};

export const findUserByIds = async (id: number[]) => {
  const results = await pool.query(
    `
    SELECT * FROM users
    WHERE id IN (?)
  `,
    [id]
  );
  const users = z.array(UserSchema).parse(results[0]);
  return users;
};
