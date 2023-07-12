import { Router } from "express";
import { body, param } from "express-validator";
import {
  getUserRoles,
  addUserRole,
  updateUserRole,
  deleteUserRoles,
} from "../controllers/role.js";
import {
  createStore,
  createStaff,
  getStore,
  getUserStores,
  getStoreStaff,
  getNotWithRoleStore,
} from "../controllers/store.js";
import * as validator from "../middlewares/validator.js";
import authenticate from "../middlewares/authenticate.js";
import * as authorization from "../middlewares/authorization.js";
const router = Router();

router.route("/store").post([authenticate, createStore]);
router.route("/stores").get([authenticate, getUserStores]);
router
  .route("/product/store/:storeId")
  .get([
    param("storeId").not().isEmpty().trim().isInt(),
    validator.handleResult,
    getNotWithRoleStore,
  ]);
router
  .route("/store/:storeId")
  .get([
    param("storeId").not().isEmpty().trim().isInt(),
    validator.handleResult,
    authenticate,
    authorization.getUserRoles,
    getStore,
  ]);
router
  .route("/store/:storeId/users")
  .get([
    param("storeId").not().isEmpty().trim().isInt(),
    validator.handleResult,
    authenticate,
    authorization.addStaffPermission,
    getStoreStaff,
  ]);

router
  .route("/store/:storeId/user")
  .post([
    param("storeId").not().isEmpty().trim().isInt(),
    body("role_id").not().isEmpty().trim().isInt(),
    body("email").not().isEmpty().trim().isEmail(),
    validator.handleResult,
    authenticate,
    authorization.addStaffPermission,
    createStaff,
  ]);
router
  .route("/store/:storeId/user/:userId/roles")
  .get([
    param("storeId").not().isEmpty().trim().isInt(),
    param("userId").not().isEmpty().trim().isInt(),
    validator.handleResult,
    authenticate,
    authorization.checkRolesPermission,
    getUserRoles,
  ]);
router
  .route("/store/:storeId/user/:userId/role/insert")
  .post([
    param("storeId").not().isEmpty().trim().isInt(),
    param("userId").not().isEmpty().trim().isInt(),
    body("role_id").not().isEmpty().trim().isInt(),
    validator.handleResult,
    authenticate,
    authorization.checkRolesPermission,
    addUserRole,
  ]);
router
  .route("/store/:storeId/user/:userId/role/update")
  .put([
    param("storeId").not().isEmpty().trim().isInt(),
    param("userId").not().isEmpty().trim().isInt(),
    body("role_id").not().isEmpty().trim().isInt(),
    validator.handleResult,
    authenticate,
    authorization.checkRolesPermission,
    updateUserRole,
  ]);
router
  .route("/store/:storeId/user/:userId/role/delete")
  .delete([
    param("storeId").not().isEmpty().trim().isInt(),
    param("userId").not().isEmpty().trim().isInt(),
    validator.handleResult,
    authenticate,
    authorization.checkRolesPermission,
    deleteUserRoles,
  ]);
export default router;
