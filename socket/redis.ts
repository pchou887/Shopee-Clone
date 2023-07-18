import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis({
  port: 6379,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
});

export const pubsub = new Redis({
  port: 6379,
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
});

export const getStr = async (key: string) => {
  const result = await redis.get(key);
  return result;
};

export const setStr = async (key: string, value: string) => {
  await redis.set(key, value);
};

export const incrStr = async (key: string) => {
  const result = await redis.incr(key);
  return result;
};

export const incrByStr = async (key: string, value: number) => {
  const result = await redis.incrby(key, value);
  return result;
};

export const decrStr = async (key: string) => {
  const result = await redis.decr(key);
  return result;
};

export const decrByStr = async (key: string, value: number) => {
  const result = await redis.decrby(key, value);
  return result;
};

export const setZset = async (key: string, value: number, member: string) => {
  const result = await redis.zadd(key, value, member);
  return result;
};

export const getZset = async (key: string) => {
  const result = await redis.zrange(key, 0, -1);
  return result;
};

export const getZsetMemberScore = async (key: string, member: string) => {
  const result = await redis.zmscore(key, member);
  return result[0];
};
