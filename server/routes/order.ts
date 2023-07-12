import { Router } from "express";
import { param } from "express-validator";
import {
  checkout,
  snapUpCheckout,
  getStoreUserOrders,
} from "../controllers/order.js";
import authenticate from "../middlewares/authenticate.js";
import * as validator from "../middlewares/validator.js";
import * as authorization from "../middlewares/authorization.js";
const router = Router();

router.route("/order/checkout").post(authenticate, checkout);
router.route("/snapup/order/checkout").post(authenticate, snapUpCheckout);
router
  .route("/store/:storeId/user/:userId/orders")
  .get([
    param("storeId").not().isEmpty().trim(),
    param("userId").not().isEmpty().trim(),
    validator.handleResult,
    authenticate,
    authorization.checkReplyCustomerPermission,
    getStoreUserOrders,
  ]);
export default router;
