import { invitationService } from "../services/invitation.service.js";

export const invitationController = {
    createInvitation: async(req, res) => {
        try{
            const result = await invitationService.createInvitation(
                req.body,
                req.user._id
            );
            if(result.success){
                res.status(201).json({
                    success: true,
                    data: result.data
                });
            } else{
                res.status(400).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error){
            console.error("createInvitation fail", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    getMyInvitations: async (req, res) => {
        try{
            const result = await invitationService.getInvitationsByUser(req.user._id);
            return res.json({success: true, data: result.data});
        } catch (error){
            console.error("getMyInvitations error", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    acceptInvitation: async(req, res) => {
        try{
            const result = await invitationService.acceptInvitation(req.params.token, req.user._id);
            if(result.success){
                res.json({
                    success: true,
                    message: result.message
                });
            } else{
                res.status(400).json({
                    success: false,
                    errors: result.errors
                })
            }
        } catch(error){
            console.error("acceptInvitation error:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    rejectInvitation: async(req, res) => {
        try{
            const result = await invitationService.rejectInvitation(req.params.token, req.user._id);
            if(result.success){
                res.json({
                    success: true,
                    message: result.message
                });
            } else{
                res.status(400).json({
                    success: false,
                    errors: result.errors
                })
            }
        } catch(error){
            console.error("rejectInvitation error:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    cancelInvitation: async(req, res) => {
        try{
            const result = await invitationService.cancelInvitation(
                req.params.invitationId,
                req.user._id,
                req.user.role
            );
            if(result.success){
                res.json({
                    success: true,
                    message: result.message
                });
            } else{
                res.status(403).json({
                    success: false,
                    errors: result.errors
                })
            }
        } catch(error){
            console.error("cancelInvitation error:", error);
            res.status(500).json({
                success: false,
                error: "Loi"
            });
        }
    }
}