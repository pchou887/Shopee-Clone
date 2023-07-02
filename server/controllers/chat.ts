import { Request, Response } from "express";
import Chat from "../models/mongoose.js";
import * as messageModel from "../models/message.js";

export const getChat = async (req: Request, res: Response) => {
  try {
    const chatData = await Chat.find({ user_id: res.locals.userId });
    res.status(200).json({ data: chatData });
  } catch (err) {
    res.status(500).json({ errors: "wrong" });
  }
};

export const userGetChatMessage = async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals;
    const storeId = Number(req.body.store_id);
    const chatData = await Chat.findOne({ user_id: userId, store_id: storeId });
    if (chatData) {
      chatData.toUserUnread = 0;
      await chatData.save();
    }
    res.status(200).json({ data: chatData });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json(err.message);
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const staffGetAllUserChat = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.body.store_id);
    const data = await Chat.find({ store_id: storeId });

    res.status(200).json({ data });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const staffGetChatMessage = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.body.user_id);
    const storeId = Number(req.body.store_id);
    const chatData = await Chat.findOne({ user_id: userId, store_id: storeId });
    if (chatData) {
      chatData.toStoreUnread = 0;
      await chatData.save();
    }
    res.status(200).json({ data: chatData });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

const organizeData = (obj: any, userId: number) => {
  const result: messageModel.Chats[] = [];
  obj.forEach((ele: messageModel.Chats) => {
    const messages = ele.message.filter(
      (message) => message.from === userId || message.from === ele.user_id
    );
    if (messages.length)
      result.push({
        user_id: ele.user_id,
        store_id: ele.store_id,
        toStoreUnread: ele.toStoreUnread,
        toUserUnread: ele.toUserUnread,
        message: messages,
      });
  });
  return result;
};

export const staffGetHadReplyChat = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.body.store_id);
    console.log(storeId);
    const data = await Chat.find({ store_id: storeId });
    // const data = await messageModel.findMessageByStore(storeId);

    const resData = organizeData(data, res.locals.userId);

    res.status(200).json({ data: resData });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const adminAllocateRoom = async (req: Request, res: Response) => {
  try {
    const userId = Array.isArray(req.body.user_id)
      ? req.body.user_id.map((ele: string) => Number(ele))
      : Number(req.body.user_id);
    const staffId = Number(req.body.staff_id);
    const storeId = Number(req.params.storeId);
    const { io } = res.locals;
    if (Array.isArray(userId)) {
      userId.forEach((ele) => {
        io.to(`store_${storeId}-user_${userId}`).emit("staffLeave", {
          storeId,
          userId: ele,
        });
        io.to(`${storeId}:${staffId}`).emit("change", {
          storeId,
          userId: ele,
        });
      });
      res.status(200).json({ data: { message: "change room success" } });
      return;
    }
    io.to(`store_${storeId}-user_${userId}`).emit("staffLeave", {
      storeId,
      userId,
    });
    io.to(`${storeId}:${staffId}`).emit("change", {
      storeId,
      userId,
      changeId: staffId,
    });
    res.status(200).json({ data: { message: "change room success" } });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const sendMessageToUser = async (req: Request, res: Response) => {
  try {
    const time = new Date();
    const from = Number(req.body.data.from);
    const userId = Number(req.body.data.userId);
    const storeId = Number(req.body.data.storeId);
    const message = req.body.data.message;
    const { io } = res.locals;
    const chat = await Chat.findOne({ user_id: userId, store_id: storeId });
    chat?.message?.push({
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
    res.status(200).json({ data: "send" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};
