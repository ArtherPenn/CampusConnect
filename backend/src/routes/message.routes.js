import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import {
  getUsersForSearchBar,
  getMessages,
  sendMessages,
} from "../controllers/message.controllers.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSearchBar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessages);

export default router;
