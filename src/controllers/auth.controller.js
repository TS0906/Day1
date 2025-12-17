import { authService } from "../services/auth.service.js";

export const authController = {
    register: async(req, res) =>{
        try{
            const result = await authService.register(req.body);
            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: "Register successful"
                });
            } else {
                res.status(400).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },

    login: async (req, res) => {
        try{
            const result = await authService.login(req.body);          
            if (result.success) {
                res.json({
                    success: true,
                    ...result.data
                });
            } else {
                res.status(401).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch(error){
            res.status(500).json({
                success: false, 
                error: "Internal Server Error"
            });
        }
    },
    getMe: async (req, res) => {
        return res.json({
            success: true, 
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    },
    getAllUsers: async (req, res) => {
        try {
            const result = await authService.getAllUsers();
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    updateUserRole: async (req, res) => {
        try {
            const userIdParam = req.params.id || req.params.userId;
            const result = await authService.updateUserRole(userIdParam, req.body.role);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                const isNotFoundError = result.errors && (result.errors.includes('User not found.') || result.errors.general);
                const statusCode = isNotFoundError ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    }
};