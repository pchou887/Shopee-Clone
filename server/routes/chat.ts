import { Router } from "express";
import { param } from "express-validator";
import {
  getChat,
  staffGetAllUserChat,
  staffGetHadReplyChat,
  staffGetChatMessage,
  userGetChatMessage,
} from "../controllers/chat.js";
import * as validator from "../middlewares/validator.js";
import authenticate from "../middlewares/authenticate.js";
import * as authorization from "../middlewares/authorization.js";
import branch from "../middlewares/branch.js";
const router = Router();

router
  .route("/store/:storeId/chat/user/:userId/message")
  .get([
    param("storeId").not().isEmpty().trim(),
    param("userId").not().isEmpty().trim(),
    validator.handleResult,
    authenticate,
    authorization.checkReplyCustomerPermission,
    staffGetChatMessage,
  ]);
router
  .route("/store/:storeId/chat/users/message")
  .get([
    param("storeId").not().isEmpty().trim(),
    validator.handleResult,
    authenticate,
    authorization.checkReplyCustomerPermission,
    branch(
      (req, res) => res.locals.userRoles[req.params.storeId].includes(1),
      staffGetAllUserChat,
      staffGetHadReplyChat
    ),
  ]);
router
  .route("/chat/:storeId/message")
  .get([
    param("storeId").not().isEmpty().trim(),
    validator.handleResult,
    authenticate,
    userGetChatMessage,
  ]);
router.route("/chats").get([authenticate, getChat]);

export default router;
