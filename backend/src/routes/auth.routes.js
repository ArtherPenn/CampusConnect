import express from "express";
import { signIn, logIn, logOut, checkAuth } from "../controllers/auth.controllers.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signIn", signIn);
router.post("/logIn", logIn);
router.post("/logOut", logOut);

router.get("/check", protectRoute, checkAuth)

export default router; 