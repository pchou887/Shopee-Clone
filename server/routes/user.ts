import { Router, Response, Request, NextFunction } from "express";
import { body } from "express-validator";
import multer from "multer";
import {
  signUp,
  signIn,
  fbLogin,
  getProfile,
  getUserOrderInfo,
} from "../controllers/user.js";
import { PROVIDER } from "../models/userProvider.js";
import * as validator from "../middlewares/validator.js";
import authenticate from "../middlewares/authenticate.js";
import * as image from "../middlewares/image.js";
import branch from "../middlewares/branch.js";
const uploadToBuffer = multer({ storage: multer.memoryStorage() });

const router = Router();

router
  .route("/user/signup")
  .post([
    body("email").isEmail().normalizeEmail(),
    body("name").exists().notEmpty().trim(),
    body("password").exists().notEmpty(),
    validator.handleResult,
    signUp,
  ]);

router.route("/user/signin").post([
  branch(
    (req) => req.body.provider === PROVIDER.NATIVE,
    [
      body("email").isEmail().normalizeEmail(),
      body("password").exists().notEmpty(),
      validator.handleResult,
      signIn,
    ]
  ),
  branch(
    (req) => req.body.provider === PROVIDER.FACEBOOK,
    [body("access_token").exists().notEmpty(), fbLogin]
  ),
  (req: Request, res: Response) => {
    res.status(400).json({ errors: "invalid provider" });
  },
]);

router.route("/user/profile").get([authenticate, getProfile]);
router.route("/user/order/info").get([authenticate, getUserOrderInfo]);

export default router;
