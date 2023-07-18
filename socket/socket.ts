import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as redisModel from "./redis.js";
import verifyJWT from "./verifyJWT.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = 8080;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.status(200).send("socket server");
});

const pubsubClient = redisModel.pubsub;

io.on("connection", (socket) => {
  socket.on("queue", async ({ token, productId, variantId, amount }) => {
    socket.join(socket.id);
    try {
      const decoded = await verifyJWT(token);
      const userId = decoded.userId;
      socket.join(`buy:${userId}`);
      const queueLength = await redisModel.incrStr("queueLength");
      const userOrderStr = await redisModel.getStr(`userOrder:${userId}`);
      if (queueLength > 500) {
        await redisModel.decrStr("queueLength");
        throw new Error("現在人數眾多，請稍後在試");
      }
      if (userOrderStr) {
        const userOrder = JSON.parse(userOrderStr);
        const orderQueue = await redisModel.getZset("order");
        if (!orderQueue.includes(`${userId}`))
          throw new Error("你正在排隊，請不要重複發送訂單");
        const productStr = await redisModel.getStr(
          `snapUp:${userOrder.productId}`
        );
        if (!productStr) throw new Error("查無此商品，請確認商品是否存在!");
        const expireTimeCheck = await redisModel.getZsetMemberScore(
          "order",
          String(userId)
        );
        const product = JSON.parse(productStr);
        const variant = product.variants.filter(
          (ele: {
            variantId: number;
            kind: string;
            stock: number;
            price: number;
          }) => ele.variantId === Number(userOrder.variantId)
        );
        const order = {
          amount: userOrder.amount,
          ...product,
          ...variant[0],
        };
        io.to(`buy:${userId}`).emit("hadOrder", {
          message: "你已經有訂單了!",
          order,
          expire: expireTimeCheck,
        });
      } else {
        const newQty = await redisModel.decrByStr(`stock:${variantId}`, amount);
        if (newQty < 0) {
          await redisModel.incrByStr(`stock:${variantId}`, amount);
          throw new Error(`庫存不足 ${userId}`);
        }
        socket.leave(socket.id);
        const numberPlate = await redisModel.incrStr(`number_plate`);
        await redisModel.setZset(`queue`, numberPlate, `queue:${userId}`);
        await redisModel.setStr(
          `userOrder:${userId}`,
          JSON.stringify({ productId, variantId, amount })
        );
        if (!(await redisModel.getStr("ordering")))
          await redisModel.setStr("ordering", "0");
        io.to(`buy:${userId}`).emit("wait", {
          message: "please wait a minute.",
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        io.to(socket.id).emit("error", { message: err.message });
        return;
      }
      io.to(socket.id).emit("error", { message: "queue error" });
    }
  });
});

pubsubClient.subscribe("turn-to", "add-stock", "error", "had-order");
pubsubClient.on("message", (channel: string, message: string) => {
  const data = JSON.parse(message);
  if (channel === "turn-to") {
    io.to(`buy:${data.id}`).emit("turnTo", {
      variantId: data.variantId,
      message: data.message,
      amount: data.amount,
      expire: data.expire,
    });
    io.emit("diffStock", {
      variantId: Number(data.variantId),
      stock: Number(data.amount),
    });
  }
  if (channel === "add-stock") {
    io.emit("addStock", {
      variantId: Number(data.variantId),
      stock: Number(data.stock),
    });
  }
  if (channel === "error") {
    io.to(`buy:${data.id}`).emit("error", {
      message: data.message,
    });
  }
  if (channel === "had-order") {
    io.to(`buy:${data.id}`).emit("hadOrder", {
      message: data.message,
      order: data.order,
      expire: data.expire,
    });
  }
});

server.listen(PORT || 8080, () => console.log("Socket server on 8080"));
