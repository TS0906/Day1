import { verifyToken } from "../utils/jwt.js";
import { authService } from "../services/auth.service.js";

export const authToken = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: "Authentication failed: No token provided" 
            });
        }

        const tokenResult = verifyToken(token);

        if (!tokenResult.success) {
            return res.status(401).json({ 
                success: false,
                error: "Authentication failed: Invalid token" 
            });
        }

        const userId = tokenResult.data.userId;
        
        const user = await authService.getUserById(userId);
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: "Authentication failed: User not found or deleted" 
            });
        }
        req.user={
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role
        };
        req.userId = user._id.toString();
        req.userRole = user.role;
        next();
    } catch(error){
        console.error("Auth Middleware Error: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}