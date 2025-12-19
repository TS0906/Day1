import { invitationService } from "../services/invitation.service.js";
import UserModel from "../models/user.js";

export const invitationController = {
    searchUser: async (req, res) => {
        try {
            const { email } = req.query; 
            if (!email) return res.status(400).json({ success: false, message: "Email required" });
            const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            return res.json({ success: true, data: user });
        } catch (error) {
            res.status(500).json({ success: false, error: "Server error" });
        }
    },
    createInvitation: async(req, res) => {
        try{
            const invitationData = {
            groupId: req.params.groupId,
            inviteeEmail: req.body.inviteeEmail
        };

        const result = await invitationService.createInvitation(
            invitationData,
            req.user._id
        );
        
        if (result.success) {
            return res.status(201).json({ success: true, data: result.data });
        }
        return res.status(400).json({ success: false, errors: result.errors });
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
            if (result.success) {
                return res.json({ success: true, data: result.data });
            }
            return res.status(400).json({ success: false, errors: result.errors });
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
            if (result.success) {
                return res.json({
                    success: true,
                    message: result.message
                });
            }
            return res.status(400).json({
                success: false,
                errors: result.errors
            });
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
            if (result.success) {
                return res.json({ success: true, message: result.message });
            }
            return res.status(400).json({ success: false, errors: result.errors });
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
            if (result.success) {
                return res.json({
                    success: true,
                    message: result.message
                });
            }
            return res.status(403).json({
                success: false,
                errors: result.errors
            });
        } catch(error){
            console.error("cancelInvitation error:", error);
            res.status(500).json({
                success: false,
                error: "Loi"
            });
        }
    }
}