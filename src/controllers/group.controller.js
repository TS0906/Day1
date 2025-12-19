import { groupService } from "../services/group.service.js";

export const groupController = {
    createGroup: async (req, res) =>{
        try{
            const result = await groupService.createGroup(req.body, req.user._id);
            if (result.success) {
                return res.status(201).json({ success: true, data: result.data });
            }
            return res.status(400).json({ success: false, errors: result.errors });
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    getMyGroups: async (req, res) =>{
        try{
            const result = await groupService.getGroupByUser(req.user._id, req.user.role);
            if (result.success) {
                return res.status(200).json({ success: true, data: result.data });
            }
            return res.status(400).json({ success: false, errors: result.errors });
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    getGroupById: async(req, res) =>{
        try{
            const result = await groupService.getGroupById(req.params.groupId, req.user._id, req.user.role);
            if (result.success) {
                return res.status(200).json({ success: true, data: result.data });
            }
            return res.status(403).json({ success: false, errors: result.errors });
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    updateGroup: async(req, res) => {
        try{
            const result = await groupService.updateGroup(req.params.groupId, req.body, req.user._id, req.user.role);
            if(result.success) {
                return res.status(200).json({success: true, data: result.data});
            }
            return res.status(403).json({success: false, errors: result.errors});
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    deleteGroup: async(req, res) =>{
        try{
            const result = await groupService.deleteGroup(req.params.groupId, req.user._id, req.user.role);
            if (result.success) {
                return res.status(200).json({ success: true, message: result.message });
            }
            return res.status(403).json({ success: false, errors: result.errors });
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    leaveGroup: async(req, res) => {
        try{
            const result = await groupService.leaveGroup(req.params.groupId, req.user._id);
            if (result.success) {
                return res.status(200).json({ success: true, message: result.message });
            }
            return res.status(400).json({ success: false, errors: result.errors });
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    getAllGroups: async(req, res) => {
        try{
            const result = await groupService.getAllGroups(req.user.role);
            if (result.success) {
                return res.status(200).json({ success: true, data: result.data });
            }
            return res.status(403).json({
                success: false,
                errors: result.errors || ["Admin access required"]
            });
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    setGroupPermissions: async(req, res) => {
        try{
            const result = await groupService.setGroupPermissions(
                req.params.groupId,
                req.body.userId,
                req.body.permissions,
                req.user._id,
                req.user.role
            );
            if (result.success) {
                return res.status(200).json({
                    success: true,
                    data: result.data,
                    message: "Permissions updated successfully"
                });
            }
            return res.status(403).json({ success: false, errors: result.errors });
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    }
};