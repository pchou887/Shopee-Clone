import { Request, Response, NextFunction } from "express";
import {
  ADMIN_ROLE,
  findUserRoles,
  groupRolesWithStoreId,
} from "../models/userRole.js";

/*
    role id = 1, "admin"                     has all permission
    role id = 2, "general manerger"          has all permission, but can't remove admin permission
    role id = 3, "product manerger"          has all permission on product and roles
    role id = 4, "customer service manerger" has all permission on customer service and roles
    role id = 5, "product department"        has insert, update product permission        
    role id = 6, "customer service"          has watch customer reply message and send message to customer permission
    role id = 7, "product intern"            has not any permission
    role id = 8, "customer service intern"   has watch customer reply message
*/

const isUserInStore = (
  obj: {
    [storeId: string]: number[];
  },
  storeId: string
) => {
  const keys = Object.keys(obj).map((ele) => Number(ele));
  const checkId = Number(storeId);
  return keys.includes(checkId);
};

const insertAndUpdateProductRoleIds: number[] = [1, 2, 3, 5];
const deleteProductRodeIds: number[] = [1, 2, 3];
export const checkProductPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const conditionArray =
      req.method === "POST" || req.method === "PUT"
        ? insertAndUpdateProductRoleIds
        : deleteProductRodeIds;
    if (!res.locals.userId) throw new Error("please login");
    const userRoles = await findUserRoles(res.locals.userId);
    const rolesWithStore = groupRolesWithStoreId(userRoles);
    if (!isUserInStore(rolesWithStore, req.body.store_id))
      throw new Error("you aren't this store staff");
    if (
      !conditionArray.some((ele) =>
        rolesWithStore[req.body.store_id].includes(ele)
      )
    )
      throw new Error("you don'n have enough permission to do");
    res.locals.userRoles = rolesWithStore;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ errors: err.message });
      return;
    }
    res.status(403).json({ errors: "your permission can't use this action" });
  }
};

const controllRolesRoleIds: number[] = [1, 2, 3, 4];
export const checkRolesPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) throw new Error("please login");
    const userRoles = await findUserRoles(res.locals.userId);
    const rolesWithStore = groupRolesWithStoreId(userRoles);
    if (!isUserInStore(rolesWithStore, req.params.storeId))
      throw new Error("you aren't this store staff");
    if (
      !controllRolesRoleIds.some((ele) =>
        rolesWithStore[req.params.storeId].includes(ele)
      )
    )
      throw new Error("you don'n have enough permission to do");
    res.locals.userRoles = rolesWithStore;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ errors: err.message });
      return;
    }
    res.status(403).json({ errors: "your permission can't use this action" });
  }
};

const watchReplyCustomerRoleIds: number[] = [1, 2, 4, 6, 8];
const sendMessageRoleIds: number[] = [1, 2, 4, 6];
export const checkReplyCustomerPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const storeId = req.params.storeId ? req.params.storeId : req.body.store_id;
    const conditionArray =
      req.method === "GET" ? watchReplyCustomerRoleIds : sendMessageRoleIds;
    if (!res.locals.userId) throw new Error("please login");
    const userRoles = await findUserRoles(res.locals.userId);
    const rolesWithStore = groupRolesWithStoreId(userRoles);
    if (!isUserInStore(rolesWithStore, storeId))
      throw new Error("you aren't this store staff");
    // if (!conditionArray.some((ele) => rolesWithStore[storeId].includes(ele)))
    //   throw new Error("you don'n have enough permission to do");
    res.locals.userRoles = rolesWithStore;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ errors: err.message });
      return;
    }
    res.status(403).json({ errors: "your permission can't use this action" });
  }
};

export const checkStoreAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) throw new Error("please login");
    const userRoles = await findUserRoles(res.locals.userId);
    const rolesWithStore = groupRolesWithStoreId(userRoles);
    if (!isUserInStore(rolesWithStore, req.params.storeId))
      throw new Error("you aren't this store staff");
    if (rolesWithStore[req.params.storeId].includes(ADMIN_ROLE))
      throw new Error("you don'n have enough permission to do");
    res.locals.userRoles = rolesWithStore;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ errors: err.message });
      return;
    }
    res.status(403).json({ errors: "your permission can't use this action" });
  }
};

const addStaffRoleIds: number[] = [1, 2, 3, 4];
export const addStaffPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) throw new Error("please login");
    const userRoles = await findUserRoles(res.locals.userId);
    const rolesWithStore = groupRolesWithStoreId(userRoles);
    if (!isUserInStore(rolesWithStore, req.params.storeId))
      throw new Error("you aren't this store staff");
    if (
      !addStaffRoleIds.some((ele) =>
        rolesWithStore[req.params.storeId].includes(ele)
      )
    )
      throw new Error("you don'n have enough permission to do");
    res.locals.userRoles = rolesWithStore;
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ errors: err.message });
      return;
    }
    res.status(403).json({ errors: "your permission can't use this action" });
  }
};

export const getUserRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.userId) throw new Error("please login");
    const userRoles = await findUserRoles(res.locals.userId);
    const rolesWithStore = groupRolesWithStoreId(userRoles);
    if (!isUserInStore(rolesWithStore, req.params.storeId))
      throw new Error("you aren't this store staff");
    res.locals.userRoles = rolesWithStore[req.params.storeId];
    next();
  } catch (err) {
    if (err instanceof Error) {
      res.status(401).json({ errors: err.message });
      return;
    }
    res.status(403).json({ errors: "your permission can't use this action" });
  }
};
