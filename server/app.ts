import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import productRoute from "./routes/product.js";
import userRoute from "./routes/user.js";
import storeRoute from "./routes/store.js";
import chatRoute from "./routes/chat.js";
import * as redisModel from "./models/redis.js";
import Chat from "./models/mongoose.js";
import { errorHandler } from "./utils/errorHandler.js";
import { fork } from "child_process";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 3000;
const MONGO_DB = process.env.MONGO ?? "";
const forked = fork("./dist/utils/queue.js");

app.use(cookieParser());
app.use(express.json());
app.use("/", express.static("public"));
app.set("view engine", "pug");

app.use((req, res, next) => {
  res.locals.io = io;
  next();
});

app.get("/", (req, res) => {
  if (req.cookies.authorization) res.redirect("/user");
  res.render("index");
});
app.get("/user", (req, res) => {
  if (!req.cookies.authorization) res.redirect("/");
  res.render("user");
});
app.get("/store", (req, res) => {
  if (!req.cookies.authorization) res.redirect("/");
  res.render("store");
});
app.get("/userchat", (req, res) => {
  if (!req.cookies.authorization) res.redirect("/");
  res.render("userchat");
});
app.get("/storechat", (req, res) => {
  if (!req.cookies.authorization) res.redirect("/");
  res.render("storechat");
});
app.get("/test", (req, res) => {
  if (!req.cookies.authorization) res.redirect("/");
  res.render("test");
});

app.use("/api/1.0", [productRoute, userRoute, storeRoute, chatRoute]);

app.use(errorHandler);

io.on("connection", (socket) => {
  socket.on("staffJoin", async ({ userId, storeId }) => {
    await redisModel.setZset(
      "staffStatus",
      1,
      `${storeId}:${userId}:${socket.id}`
    );

    await redisModel.setZset("servedNumber", 0, `${storeId}:${userId}`);
    socket.join(`${storeId}`);
    socket.join(`${storeId}:${userId}`);
    io.to("admin").emit("staffOnline", { data: userId });
  });

  socket.on("userJoin", async ({ userId, storeId }) => {
    const roomName = `store_${storeId}-user_${userId}`;
    socket.join(roomName);
    const staffServedNumber = await redisModel.getZset("servedNumber");
    const storeStaff = staffServedNumber.filter((ele) =>
      ele.includes(`${storeId}:`)
    );
    const chat =
      (await Chat.findOne({ user_id: userId, store_id: storeId })) ??
      new Chat({ user_id: userId, store_id: storeId, message: [] });
    await chat.save();
    if (storeStaff.length)
      io.to(storeStaff[0]).emit("hasCustomer", {
        room: roomName,
        userId,
        storeId,
      });
  });

  socket.on("customerService", async ({ room, storeId, userId }) => {
    await redisModel.incrZset("servedNumber", 1, `${storeId}:${userId}`);
    socket.join(room);
  });

  socket.on("staffLeaveRoom", async ({ room, storeId, userId }) => {
    await redisModel.incrZset("servedNumber", -1, `${storeId}:${userId}`);
    socket.leave(room);
    io.to(room).emit("leave", { message: "staff is leave this room" });
  });

  socket.on("userLeaveRoom", ({ room }) => {
    socket.leave(room);
    io.to(room).emit("leave", { message: "user is leave this room" });
  });
  socket.on("toUser", async (data) => {
    const time = new Date();
    const from = Number(data.from);
    const userId = Number(data.userId);
    const storeId = Number(data.storeId);
    const message = data.message;
    const chat = await Chat.findOne({ user_id: userId, store_id: storeId });
    if (chat) {
      chat.toUserUnread += 1;
      chat.message.push({
        from: from,
        content: message,
        timestamp: time,
      });
      await chat?.save();
      io.to(`store_${storeId}-user_${userId}`).emit("toUser", {
        from,
        userId,
        storeId,
        message,
        time,
      });
    }
  });

  socket.on("toStore", async (data) => {
    const time = new Date();
    const from = Number(data.from);
    const userId = Number(data.userId);
    const storeId = Number(data.storeId);
    const message = data.message;
    const chat = await Chat.findOne({ user_id: userId, store_id: storeId });
    if (chat) {
      chat.toStoreUnread += 1;
      chat.message.push({
        from: from,
        content: message,
        timestamp: time,
      });
      await chat?.save();
      io.to(`store_${storeId}-user_${userId}`).emit("toStore", {
        from,
        userId,
        storeId,
        message,
        time,
      });
    }
  });
  socket.on("queue", async ({ amount }) => {
    socket.join(socket.id);
    const queue = await redisModel.getZset(`queue`);
    if (queue.length > 100) {
      io.to(socket.id).emit("overload", {
        message: "Too many people. Please try again after a few minutes.",
      });
    } else {
      const numberPlate = await redisModel.incrStr(`number_plate`);
      await redisModel.setZset(`queue`, numberPlate, socket.id);
      await redisModel.setStr(`amount:${socket.id}`, String(amount));
      if (!(await redisModel.getStr("ordering")))
        await redisModel.setStr("ordering", "0");
      io.to(socket.id).emit("wait", { message: "please wait a minute." });
    }
  });
  socket.on("disconnect", async () => {
    const staffStatus = await redisModel.getZset("staffStatus");
    const isStaff = staffStatus.filter((ele) => ele.includes(socket.id));
    if (isStaff.length) {
      await redisModel.rmZsetMember("staffStatus", isStaff[0]);
      await redisModel.rmZsetMember(
        "servedNumber",
        isStaff[0].replace(`:${socket.id}`, "")
      );
    }
    // const queueMembers = await redisModel.getZset(`queue`);
    // if (queueMembers.length) {
    //   await redisModel.rmZsetMember("queue", socket.id);
    // }
  });
});
forked.send("start");
forked.on("message", (message: any) => {
  if (message.type === "turnTo") {
    io.to(message.data.id).emit("turnTo", message.data);
  }
  if (message.type === "error") {
    io.to(message.data.id).emit("error", message.data);
  }
});
forked.on("error", console.error);
forked.on("exit", (code) => {
  if (code != 0)
    console.error(new Error(`Worker stopped with exit code ${code}`));
});

server.listen(PORT || 3000, () =>
  console.log(`Server is listen on ${PORT || 3000}`)
);
mongoose.connect(MONGO_DB).then(() => console.log("Mongo DB connecting"));
