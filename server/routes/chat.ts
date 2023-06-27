import { Router } from "express";
import {
  getChat,
  staffGetAllUserChat,
  staffGetHadReplyChat,
  staffGetChatMessage,
  userGetChatMessage,
} from "../controllers/chat.js";
import authenticate from "../middlewares/authenticate.js";
import * as authorization from "../middlewares/authorization.js";
import branch from "../middlewares/branch.js";
const router = Router();

router.route("/chat/user/message").post([authenticate, staffGetChatMessage]);
router
  .route("/chat/users/message")
  .post([
    authenticate,
    authorization.checkReplyCustomerPermission,
    branch(
      (req, res) => res.locals.userRoles[req.body.store_id].includes(1),
      staffGetAllUserChat,
      staffGetHadReplyChat
    ),
  ]);
router.route("/chat/message").post([authenticate, userGetChatMessage]);
router.route("/chat/message/all").post([authenticate, getChat]);

export default router;
