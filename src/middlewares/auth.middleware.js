import { verifyToken } from "../utils/jwt.js";
import UserModel from "../models/user.js";

export const authToken = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization || "";
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, error: "No token provided" });
        }
        const token = authHeader.split(' ')[1];
        const result = verifyToken(token);
        if(!result.success){
            return res.status(401).json({success: false, error: "Invalid token"});
        }
        const decoded = result.data;
        const user = await UserModel.findById(decoded.userId).lean();
        if (!user || user.isDeleted) {
            return res.status(401).json({success: false, error: "User not found or deleted"});
        }
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        next();
    } catch(error){
        console.error("Auth Middleware Error: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
};