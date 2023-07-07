import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createServer } from "https";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import productRoute from "./routes/product.js";
import userRoute from "./routes/user.js";
import storeRoute from "./routes/store.js";
import chatRoute from "./routes/chat.js";
import orderRoute from "./routes/order.js";
import * as redisModel from "./models/redis.js";
import Chat from "./models/mongoose.js";
import { errorHandler } from "./utils/errorHandler.js";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "./private.key";
const CERTIFICATE_CRT = process.env.CERTIFICATE_CRT || "./cert.crt";

const __dirname = path.resolve("../client/dist/index.html").replace(/\\/g, "/");
const __dirnamePrivate = path.resolve(PRIVATE_KEY).replace(/\\/g, "/");
const __dirnameCertificate = path.resolve(CERTIFICATE_CRT).replace(/\\/g, "/");

const app = express();
const server = createServer(
  {
    key: fs.readFileSync(__dirnamePrivate),
    cert: fs.readFileSync(__dirnameCertificate),
  },
  app
);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
  allowEIO3: true,
});
const PORT = 3000;
const MONGO_DB = process.env.MONGO ?? "";

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static("../client/dist"));

app.use((req, res, next) => {
  res.locals.io = io;
  next();
});

app.use("/api/1.0", [
  productRoute,
  userRoute,
  storeRoute,
  chatRoute,
  orderRoute,
]);

app.get("*", (req, res) => {
  res.sendFile(__dirname);
});

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
  });
});

server.listen(PORT || 3000, () =>
  console.log(`Server is listen on ${PORT || 3000}`)
);
mongoose.connect(MONGO_DB).then(() => console.log("Mongo DB connecting"));
