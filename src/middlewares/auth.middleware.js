import { verifyToken } from "../utils/jwt.js";
import { authService } from "../services/auth.service.js";

export const authToken = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: "Token khong hop le" 
            });
        }

        const tokenResult = verifyToken(token);
        if (!tokenResult.success) {
            return res.status(401).json({ 
                success: false,
                error: "Token khong hop le" 
            });
        }

        const userId = tokenResult.data.user_id;
        
        const user = await authService.getUserById(userId);
        if (!user) {
            return res.status(403).json({ 
                success: false,
                error: "Khong thay user" 
            });
        }

        req.user = user;
        req.userId = userId; 
        
        next();
    } catch{
        return res.status(500).json({
            success: false,
            error: "Failed"
        })
    }
}