import * as redisModel from "../models/redis.js";

process.on("message", () => {
  console.log("worker doing.");
  userToOrderPage();
});

const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const chechStock = async (amount: number, socketId: string) => {
  if (await redisModel.getStr(`userOrder:${socketId}`))
    throw new Error(
      `You already have this product order. Please wait or go to order page. ${socketId}`
    );
  const newQty = await redisModel.decrByStr(`stock`, amount);
  if (newQty < 0) {
    await redisModel.incrByStr(`stock`, amount);
    throw new Error(`Inventory shortage ${socketId}`);
  }
  await redisModel.decrStr("ordering");
  await redisModel.setStr(`userOrder:${socketId}`, "waitPay");
};

const userToOrderPage = async () => {
  while (true) {
    try {
      const orderingNumber = Number(await redisModel.getStr("ordering"));
      if (orderingNumber < 20) {
        const userId = await redisModel.bpopminZset(`queue`);
        if (!Array.isArray(userId)) {
          continue;
        }
        const userSocketId = userId[1];
        const ordering = await redisModel.incrStr("ordering");
        console.log(ordering);
        console.log(userSocketId);
        const amount = Number(
          await redisModel.getStr(`amount:${userSocketId}`)
        );
        await chechStock(amount, userSocketId);
        if (process.send) {
          process.send({
            type: "turnTo",
            data: {
              message: "turn to you visit order page",
              id: userSocketId,
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
