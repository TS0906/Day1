import { invitationService } from "../services/invitation.service.js";

export const invitationController = {
    createInvitation: async(req, res) => {
        try{
            const result = await invitationService.createInvitation(
                req.params.groupId,
                req.userId,
                req.body.email
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
            res.status(500).json({
                success: false,
                error: "Loi"
            })
        }
    },
    getMyInvitations: async (req, res) => {
        try{
            const result = await invitationService.getInvitationsByUser(req.user.email);
            if(result.success){
                res.json({
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
            res.status(500).json({
                success: false,
                error: "Loi"
            });
        }
    },
    acceptInvitation: async(req, res) => {
        try{
            const result = await invitationService.acceptInvitation(req.params.token, req.userId);
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
            res.status(500).json({
                success: false,
                error: "Loi"
            });
        }
    },
    rejectInvitation: async(req, res) => {
        try{
            const result = await invitationService.rejectInvitation(req.params.token, req.userId);
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
            res.status(500).json({
                success: false,
                error: "Loi"
            })
        }
    },
    cancelInvitation: async(req, res) => {
        try{
            const result = await invitationService.cancelInvitation(
                req.params.invitationId,
                req.userId,
                req.userRole
            );
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
            console.error("Cancel invitation error:", error);
            res.status(500).json({
                success: false,
                error: "Loi"
            });
        }
    }
}