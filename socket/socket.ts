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
const pubsubClient = redisModel.pubsub;

io.on("connection", (socket) => {
  socket.on("queue", async ({ token, productId, variantId, amount }) => {
    socket.join(socket.id);
    try {
      const decoded = await verifyJWT(token);
      const userId = decoded.userId;
      socket.join(`buy:${userId}`);
      const queueLength = await redisModel.incrStr("queueLength");
      const isOrder = await redisModel.getStr(`userOrder:${userId}`);
      if (queueLength > 500 || isOrder) {
        await redisModel.decrStr("queueLength");
        throw new Error(
          "Too many people. Please try again after a few minutes."
        );
      }
      const newQty = await redisModel.decrByStr(`stock:${variantId}`, amount);
      if (newQty < 0) {
        await redisModel.incrByStr(`stock:${variantId}`, amount);
        throw new Error(`Inventory shortage ${userId}`);
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
      io.to(`buy:${userId}`).emit("wait", { message: "please wait a minute." });
    } catch (err) {
      if (err instanceof Error) {
        io.to(socket.id).emit("error", { message: err.message });
        return;
      }
      io.to(socket.id).emit("error", { message: "queue error" });
    }
  });
  socket.on("disconnect", async () => {
    // const queueMembers = await redisModel.getZset(`queue`);
    // if (queueMembers.length) {
    //   await redisModel.rmZsetMember("queue", socket.id);
    // }
  });
});

pubsubClient.subscribe("turn-to", "add-stock", "error");
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
});

server.listen(PORT || 8080, () => console.log("Socket server on 8080"));
