import * as redisModel from "../models/redis.js";

const pubsubClient = redisModel.pubsub;
const queueClient = redisModel.queue;

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const userToOrderPage = async () => {
  console.log("queue is working");
  while (true) {
    try {
      const orderingNumber = Number(await redisModel.getStr("ordering"));
      if (orderingNumber < 5) {
        const user = await queueClient.bzpopmin(`queue`, 1);
        if (!Array.isArray(user)) {
          continue;
        }
        const userId = user[1].replace("queue:", "");
        const userOrderStr = await redisModel.getStr(`userOrder:${userId}`);
        if (!userOrderStr) throw new Error(`你並沒有在列隊當中 ${userId}`);
        const userOrder = JSON.parse(userOrderStr);
        const amount = Number(userOrder.amount);
        const expireTime = new Date().getTime() + 1 * 60 * 1000;
        await redisModel.incrStr("ordering");
        await redisModel.decrByStr(`stock:${userOrder.variantId}`, amount);
        await redisModel.setZset("order", expireTime, userId);
        const data = {
          message: "turn to you visit order page",
          id: userId,
          amount,
          variantId: userOrder.variantId,
          expire: expireTime,
        };
        await redisModel.decrStr("queueLength");
        pubsubClient.publish("turn-to", JSON.stringify(data));
      } else {
        await sleep(1000);
      }
    } catch (err) {
      if (err instanceof Error) {
        const tmpArr = err.message.split(" ");
        const userId = tmpArr[tmpArr.length - 1];
        const data = {
          message: err.message.replace(` ${userId}`, ""),
          id: userId,
        };
        pubsubClient.publish("error", JSON.stringify(data));
      }
      await sleep(1000);
      continue;
    }
  }
};

userToOrderPage();
