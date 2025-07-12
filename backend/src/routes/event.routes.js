import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { 
  createEvent, 
  getGroupEvents, 
  deleteEvent 
} from "../controllers/event.controllers.js";

const router = express.Router();

router.post("/create", protectRoute, createEvent);
router.get("/group/:groupId", protectRoute, getGroupEvents);
router.delete("/:eventId", protectRoute, deleteEvent);

export default router;