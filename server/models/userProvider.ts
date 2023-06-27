import { z } from "zod";
import * as argon2 from "argon2";
import pool from "./dbPool.js";

/*
  id bigint unsigned NOT NULL AUTO_INCREMENT
  user_id bigint unsigned
  provider enum('native','facebook','google') NOT NULL,
  token VARCHAR(255) NOT NULL
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
**/

export const PROVIDER = {
  NATIVE: "native",
  FACEBOOK: "facebook",
  GOOGLE: "google",
};

export const createNativeProvider = async (
  userId: number,
  password: string
) => {
  const token = await argon2.hash(password);
  await pool.query(
    `
    INSERT INTO user_providers (user_id, provider, token)
    VALUES(?, ?, ?)
  `,
    [userId, PROVIDER.NATIVE, token]
  );
};

export const createFbProvider = async (userId: number, providerId: string) => {
  await pool.query(
    `
    INSERT INTO user_providers (user_id, provider, token)
    VALUES(?, ?, ?)
  `,
    [userId, PROVIDER.FACEBOOK, providerId]
  );
};

const ProviderSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  provider: z.enum(["native", "facebook", "google"]),
  token: z.string(),
});

export const checkNativeProviderToken = async (
  userId: number,
  password: string
) => {
  const results = await pool.query(
    `
    SELECT * FROM user_providers
    WHERE user_id = ? AND provider = "native"
  `,
    [userId]
  );
  const providers = z.array(ProviderSchema).parse(results[0]);
  return argon2.verify(providers[0].token, password);
};

export const findFbProvider = async (userId: number) => {
  const results = await pool.query(
    `
    SELECT * FROM user_providers
    WHERE user_id = ? AND provider = "facebook"
  `,
    [userId]
  );
  const providers = z.array(ProviderSchema).parse(results[0]);
  if (providers.length > 1) {
    throw new Error("fb provide length wrong");
  }
  return providers[0];
};
