import { invitationService } from "../services/invitation.service.js";

export const invitationController = {
    createInvitation: async(req, res) => {
        try{
            const result = await invitationService.createInvitation(
                { groupId: req.params.groupId, inviteeEmail: req.body.email },
                req.user._id
            );
            if(result.success){
                res.status(201).json({
                    success: true,
                    data: result.data
                });
            } else{
                const statusCode = result.errors && (result.errors.includes('Permission denied') || result.errors.includes('Group not found')) ? 403 : 400;
                res.status(statusCode).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    getMyInvitations: async (req, res) => {
        try{
            const result = await invitationService.getInvitationsByUser(req.user._id);
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
                const isPermissionError = result.errors && result.errors.includes('Permission denied');
                const isNotFoundError = result.errors && result.errors.includes('Invitation not found');
                
                let statusCode = 400;
                if (isPermissionError) statusCode = 403;
                else if (isNotFoundError) statusCode = 404;

                res.status(statusCode).json({
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
    }
}