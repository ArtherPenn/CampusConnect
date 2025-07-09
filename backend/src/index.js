import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import chatRoute from "./routes/chat.routes.js";
import groupRoutes from "./routes/group.routes.js";

//const app = express();
dotenv.config();

const PORT = process.env.PORT;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/chat", chatRoute);
app.use("/api/group", groupRoutes);

server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});
