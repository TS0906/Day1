import { authService } from "../services/auth.service.js";

export const authController = {
    register: async(req, res) =>{
        try{
            const result = await authService.register(req.body);
            if (result.success) {
                res.status(201).json({
                    success: true,
                    ...result.data
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
                error: "Error"
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
                error: "Error"
            });
        }
    },
    getMe: async (req, res) => {
        try {
            res.json({
                success: true,
                data: {
                    user: {
                        id: req.user._id,
                        name: req.user.name,
                        email: req.user.email
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Error"
            });
        }
    }
}