import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis({
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
export const getZsetWithScores = async (key: string) => {
  const result = await redis.zrange(key, 0, -1, "WITHSCORES");
  return result;
};

export const incrZset = async (key: string, incr: number, member: string) => {
  await redis.zincrby(key, incr, member);
};

export const rmZsetMember = async (key: string, member: string) => {
  await redis.zrem(key, member);
};

export const bpopminZset = async (key: string) => {
  const result = await redis.bzpopmin(key, 1);
  return result;
};

export const setExpireStr = async (key: string) => {
  await redis.set(key, 1, "EX", 900);
};

export const multi = async () => {
  return redis.multi({ pipeline: true });
};

export const exec = () => {
  return redis.exec((err, result) => result);
};
