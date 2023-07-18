import * as redisModel from "../models/redis.js";
import { z } from "zod";
import dotenv from "dotenv";

const pubsubClient = redisModel.pubsub;
dotenv.config();

const UserOrderSchema = z.object({
  productId: z.number(),
  variantId: z.number(),
  amount: z.number(),
});

type UserOrder = z.infer<typeof UserOrderSchema>;

interface UserOrderWithId extends UserOrder {
  userId: number;
}

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const removeExpireObj = async (obj: { [expireTime: string]: number }) => {
  const nowTime = new Date().getTime();

  const overdueTime = Object.keys(obj).filter((ele) => nowTime > Number(ele));
  await Promise.all(
    overdueTime.map((ele) => redisModel.rmZsetMember("order", `${obj[ele]}`))
  );
  return overdueTime.map((ele) => obj[ele]);
};

const checkExpireOrder = async () => {
  console.log("check worker is running");
  while (true) {
    try {
      const order = await redisModel.getZsetWithScores("order");
      if (Array.isArray(order) && order.length) {
        const orderObj = order.reduce(
          (acc: { [expireTime: string]: number }, ele, index) => {
            if (index % 2 === 1) acc[ele] = Number(order[index - 1]);
            return acc;
          },
          {}
        );
        const expireUserIds = await removeExpireObj(orderObj);

        if (expireUserIds.length) {
          const redisUserOrders = await Promise.all(
            expireUserIds.map((ele) => redisModel.getStr(`userOrder:${ele}`))
          );
          const userOrders = redisUserOrders.reduce(
            (acc: UserOrderWithId[], ele, index) => {
              if (ele) {
                const obj = JSON.parse(ele);
                const userOrder = UserOrderSchema.parse(obj);
                acc.push({ ...userOrder, userId: expireUserIds[index] });
                return acc;
              }
              return acc;
            },
            []
          );
          await Promise.all([
            userOrders.map((ele) =>
              redisModel.incrByStr(`stock:${ele.variantId}`, ele.amount)
            ),
            userOrders.map((ele) =>
              redisModel.delStr(`userOrder:${ele.userId}`)
            ),
          ]);
          await redisModel.decrByStr("ordering", expireUserIds.length);
          userOrders.forEach((ele) =>
            pubsubClient.publish(
              "add-stock",
              JSON.stringify({ variantId: ele.variantId, stock: ele.amount })
            )
          );
        }
      }
    } catch (err) {
      console.error("error message", err);
    } finally {
      await sleep(30 * 1000);
    }
  }
};

checkExpireOrder();
