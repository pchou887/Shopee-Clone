import { Router } from "express";
import { checkout, snapUpCheckout } from "../controllers/order.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.route("/order/checkout").post(authenticate, checkout);
router.route("/snapup/order/checkout").post(authenticate, snapUpCheckout);

export default router;
