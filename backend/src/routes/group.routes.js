import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { 
  createGroup, 
  getUserGroups, 
  addMemberToGroup, 
  removeMemberFromGroup, 
  updateGroup 
} from "../controllers/group.controllers.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getUserGroups);
router.put("/:groupId/add-member", protectRoute, addMemberToGroup);
router.delete("/:groupId/remove-member/:memberId", protectRoute, removeMemberFromGroup);
router.put("/:groupId", protectRoute, updateGroup);

export default router;