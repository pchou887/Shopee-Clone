import { Request, Response } from "express";
import Chat, { IChatHistory } from "../models/mongoose.js";
import * as storeModel from "../models/store.js";
import { findUserByIds } from "../models/user.js";

export const getChat = async (req: Request, res: Response) => {
  try {
    const chatData = await Chat.find({ user_id: res.locals.userId });
    const storeIds = chatData.map((ele) => ele.store_id);
    const stores = await storeModel.findStores(storeIds);
    const storeNameObj = stores.reduce(
      (obj: { [storeId: number]: string }, ele) => {
        obj[ele.id] = ele.name;
        return obj;
      },
      {}
    );
    const resData = chatData.map((ele) => ({
      storeId: ele.store_id,
      toStoreUnread: ele.toStoreUnread,
      toUserUnread: ele.toUserUnread,
      messages: ele.message,
      storeName: storeNameObj[ele.store_id],
    }));
    res.status(200).json({ data: resData });
  } catch (err) {
    res.status(500).json({ errors: "wrong" });
  }
};

export const userGetChatMessage = async (req: Request, res: Response) => {
  try {
    const { userId } = res.locals;
    const storeId = Number(req.params.storeId);
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

const organizeData = (obj: IChatHistory[], userId: number) => {
  return obj.reduce((acc: IChatHistory[], ele) => {
    const messages = ele.message.filter(
      (message) => message.from === userId || message.from === ele.user_id
    );
    if (messages.length)
      acc.push({
        user_id: ele.user_id,
        store_id: ele.store_id,
        toStoreUnread: ele.toStoreUnread,
        toUserUnread: ele.toUserUnread,
        message: messages,
      });
    return acc;
  }, []);
};

interface AdminChatSchema extends IChatHistory {
  name: string;
  picture: string;
}

const adminChatOrganize = (
  chatObj: IChatHistory[],
  userData: { id: number; email: string; name: string; picture: string }[]
) => {
  const userDataMap = userData.reduce(
    (acc: { [userId: number]: { name: string; picture: string } }, ele) => {
      acc[ele.id] = { name: ele.name, picture: ele.picture };
      return acc;
    },
    {}
  );
  const obj = chatObj.reduce((acc: AdminChatSchema[], ele) => {
    acc.push({
      user_id: ele.user_id,
      store_id: ele.store_id,
      message: ele.message,
      toStoreUnread: ele.toStoreUnread,
      toUserUnread: ele.toUserUnread,
      name: userDataMap[ele.user_id].name,
      picture: `https://d1a26cbu5iquck.cloudfront.net/${
        userDataMap[ele.user_id].picture
      }`,
    });
    return acc;
  }, []);
  return obj;
};

export const staffGetAllUserChat = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.params.storeId);
    const chatData = await Chat.find({ store_id: storeId });
    if (!chatData.length) return res.status(200).json({ data: chatData });
    const userIds = chatData.map((ele) => ele.user_id);
    const userData = await findUserByIds(userIds);
    const data = adminChatOrganize(chatData, userData);
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
    const userId = Number(req.params.userId);
    const storeId = Number(req.params.storeId);
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

export const staffGetHadReplyChat = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.params.storeId);
    const data = await Chat.find({ store_id: storeId });
    const userIds = data.map((ele) => ele.user_id);
    const userData = await findUserByIds(userIds);

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
