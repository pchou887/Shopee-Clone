import * as redisModel from "../models/redis.js";

const pubsubClient = redisModel.pubsub;

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const userToOrderPage = async () => {
  console.log("queue is working");
  while (true) {
    try {
      const orderingNumber = Number(await redisModel.getStr("ordering"));
      if (orderingNumber < 5) {
        const user = await redisModel.bpopminZset(`queue`);
        if (!Array.isArray(user)) {
          continue;
        }

        const userId = user[1].replace("queue:", "");
        const userOrderStr = await redisModel.getStr(`userOrder:${userId}`);
        const orderingQueue = await redisModel.getZsetWithScores("order");
        if (!userOrderStr) throw new Error("you didn't in queue");
        if (orderingQueue.length && orderingQueue.includes(userId)) {
          throw new Error(
            `You already have this product order. Please wait or go to order page. ${userId}`
          );
        }
        const userOrder = JSON.parse(userOrderStr);
        const expireTime = new Date().getTime() + 1 * 60 * 1000;
        await redisModel.incrStr("ordering");
        await redisModel.setZset("order", expireTime, userId);
        const amount = Number(userOrder.amount);
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
      continue;
    }
  }
};

userToOrderPage();
