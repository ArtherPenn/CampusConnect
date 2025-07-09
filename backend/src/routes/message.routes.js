import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
  getUsersForSearchBar,
  getDirectMessages,
  getGroupMessages,
  sendDirectMessage,
  sendGroupMessage,
} from "../controllers/message.controllers.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSearchBar);
router.get("/direct/:id", protectRoute, getDirectMessages);
router.get("/group/:groupId", protectRoute, getGroupMessages);

router.post("/send/direct/:id", protectRoute, sendDirectMessage);
router.post("/send/group/:groupId", protectRoute, sendGroupMessage);

export default router;
