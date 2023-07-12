import { Request, Response } from "express";
import * as storeModel from "../models/store.js";
import * as userModel from "../models/user.js";
import * as userRoleModel from "../models/userRole.js";
import * as redisModel from "../models/redis.js";

export const createStore = async (req: Request, res: Response) => {
  try {
    const storeId = await storeModel.createStore(req.body);
    if (typeof storeId !== "number") {
      throw new Error("create store failed.");
    }
    await userRoleModel.addStoreAdmin(res.locals.userId, storeId);
    res.status(200).json({ data: storeId });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};
export const createStaff = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findUser(req.body.email);
    if (!user) throw new Error("Can't not found user");
    const userId = user.id;
    const storeId = Number(req.params.storeId);
    const userRolesWithStore = await userRoleModel.findUserRoles(userId);
    if (userRolesWithStore.some((ele) => ele.store_id === storeId))
      throw new Error("this guy is already working at this store");
    const roleId: number[] = Array.isArray(req.body.role_id)
      ? req.body.role_id.map((ele: string) => Number(ele))
      : [Number(req.body.role_id)];
    await userRoleModel.addRoleToUser(userId, storeId, roleId);
    res.status(200).json({
      data: {
        userId: res.locals.userId,
        storeId,
        roleId,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const getStore = async (req: Request, res: Response) => {
  try {
    const stores = await storeModel.findStore(Number(req.params.storeId));
    res
      .status(200)
      .json({ data: { ...stores[0], roles: res.locals.userRoles } });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const getNotWithRoleStore = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.params.storeId);
    const stores = await storeModel.findStore(storeId);
    const adminUser = await userRoleModel.findAdminUser(storeId);
    const adminUserId = adminUser.user_id;
    const adminProfile = await userModel.findUserById(adminUserId);
    res.status(200).json({
      data: {
        ...stores[0],
        picture: `https://d1a26cbu5iquck.cloudfront.net/${adminProfile.picture}`,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

interface StoreSchema {
  id: number;
  name: string;
  city: string;
  district: string;
  create_at: Date;
}

export const getUserStores = async (req: Request, res: Response) => {
  try {
    const stores = await storeModel.findUserStore(res.locals.userId);
    const userStoresRole = await userRoleModel.findUserRoles(res.locals.userId);
    const ownStoreRole = userStoresRole.filter((ele) => ele.role_id === 1);
    const ownStoreIds = ownStoreRole.map((ele) => ele.store_id);
    const data = stores.reduce((obj: any, ele) => {
      if (!obj["own"] || !obj["other"]) {
        obj["own"] = [];
        obj["other"] = [];
      }
      if (ownStoreIds.includes(ele.id)) obj["own"].push(ele);
      else obj["other"].push(ele);
      return obj;
    }, {});
    res.status(200).json({ data });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

const organizeStaffStatus = (
  staffStatus: string[],
  storeId: number,
  staffId: number[]
) => {
  const storeWithStaffId = staffId.map((ele) => `${storeId}:${ele}`);
  const notInCacheStaffId = storeWithStaffId.filter(
    (ele) => !staffStatus.includes(ele)
  );
  const result = staffStatus.reduce(
    (obj: { [storeIdWithUserId: string]: number }, ele, index) => {
      if (index % 2 === 0 && storeWithStaffId.includes(ele)) {
        obj[ele] = Number(staffStatus[index + 1]);
      }
      return obj;
    },
    {}
  );
  notInCacheStaffId.forEach((ele) => {
    result[ele] = 0;
  });

  return result;
};

export const getStoreStaff = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.params.storeId);
    const staff = await storeModel.findStoreStaff(storeId);
    const staffId = staff.map((ele) => ele.user_id);
    const staffStatus = await redisModel.getZsetWithScores("staffStatus");
    const storeStaffStatus = organizeStaffStatus(staffStatus, storeId, staffId);
    res.status(200).json({ data: staff, staffStatus: storeStaffStatus });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "Oops! unknow wrong" });
  }
};
