import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { getUsersForSideBar, addUsersToContacts} from "../controllers/chat.controllers.js";

const router = express.Router();

router.get("/contacts/:id", protectRoute, getUsersForSideBar);
router.get("/contacts/addUser/:id", protectRoute, addUsersToContacts);

export default router; 