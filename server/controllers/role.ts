import { Request, Response } from "express";
import * as userRoleModel from "../models/userRole.js";
import * as role from "../models/role.js";

export const getUserNotOwnedRoles = async (req: Request, res: Response) => {
  try {
    const storeId = Number(req.params.storeId);
    const userId = Number(req.params.user_id);
    const roles = await role.findUserNotOwnedRoles(userId, storeId);
    res.status(200).json({ data: roles });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "server wrong" });
  }
};
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const storeId = Number(req.params.storeId);
    const userRolesWithTimestamp =
      await userRoleModel.findUserRolesWithTimestamp(userId, storeId);
    res.status(200).json({ data: userRolesWithTimestamp });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const addUserRole = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (userId === res.locals.userId)
      throw new Error("can not change own role");
    const storeId = Number(req.params.storeId);
    const roleId: number[] = Array.isArray(req.body.role_id)
      ? req.body.roleId.map((ele: string) => Number(ele))
      : [Number(req.body.roleId)];
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
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (userId === res.locals.userId)
      throw new Error("can not change own role");
    const storeId = Number(req.params.storeId);
    const roleId = Number(req.body.role_id);
    await userRoleModel.updateUserRole(userId, storeId, roleId);
    res.status(200).json({
      data: {
        userId,
        storeId,
        roleId,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      console.log(err);
      res.status(400).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};
export const deleteUserRole = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (userId === res.locals.userId)
      throw new Error("can not change own role");
    const storeId = Number(req.params.storeId);
    const roleId: number[] = Array.isArray(req.body.role_id)
      ? req.body.roleId.map((ele: string) => Number(ele))
      : [Number(req.body.roleId)];
    await userRoleModel.deleteUserRole(userId, storeId, roleId);
    res.status(200).json({
      data: {
        userId,
        storeId,
        roleId,
      },
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ errors: err.message });
      return;
    }
    res.status(500).json({ errors: "something wrong" });
  }
};
