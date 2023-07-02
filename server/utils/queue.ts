import * as redisModel from "../models/redis.js";

process.on("message", () => {
  console.log("worker doing.");
  userToOrderPage();
});

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const chechStock = async (amount: number, userId: string) => {
  const newQty = await redisModel.decrByStr(`stock`, amount);
  if (newQty < 0) {
    await redisModel.incrByStr(`stock`, amount);
    throw new Error(`Inventory shortage ${userId}`);
  }
  await redisModel.setExpireStr(`userOrder:${userId}`);
};

const userToOrderPage = async () => {
  while (true) {
    try {
      const orderingNumber = Number(await redisModel.getStr("ordering"));
      if (orderingNumber < 2) {
        const user = await redisModel.bpopminZset(`queue`);
        if (!Array.isArray(user)) {
          continue;
        }

        const userId = user[1].replace("queue:", "");
        const isOrder = await redisModel.getStr(`userOrder:${userId}`);
        if (isOrder) {
          throw new Error(
            `You already have this product order. Please wait or go to order page. ${userId}`
          );
        } else {
          const ordering = await redisModel.incrStr("ordering");
          console.log(ordering);
        }
        const amount = Number(await redisModel.getStr(`amount:${userId}`));
        await chechStock(amount, userId);
        console.log(userId);
        if (process.send) {
          process.send({
            type: "turnTo",
            data: {
              message: "turn to you visit order page",
              id: userId,
              amount,
            },
          });
        }
      } else {
        await sleep(1000);
      }
    } catch (err) {
      if (process.send && err instanceof Error) {
        const tmpArr = err.message.split(" ");
        const socketId = tmpArr[tmpArr.length - 1];
        process.send({
          type: "error",
          data: {
            message: err.message.replace(` ${socketId}`, ""),
            id: socketId,
          },
        });
      }
      console.error(err);
      continue;
    }
  }
};
