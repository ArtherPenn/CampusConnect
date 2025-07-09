import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

export default async function protectRoute(request, response, next) {
    const token = request.cookies.jwt;

    if (!token) { 
        return response.status(401).json({ message: "Unauthorized access!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return response.status(401).json({ message: "Invalid token!" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
        return response.status(404).json({ message: "User not found!" });
    }

    request.user = user;
    next();
}