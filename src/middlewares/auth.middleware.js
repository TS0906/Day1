import { verifyToken } from "../utils/jwt.js";
import UserModel from "../models/user.js";

export const authToken = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, error: "No token provided" });
        }
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if(!decoded){
            return res.status(401).json({success: false, error: "Invalid token"});
        }
        const user = await UserModel.findById(decoded.id).lean();
        if (!user || !user.isDeleted) {
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