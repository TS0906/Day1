import { groupService } from "../services/group.service.js";

export const groupController = {
    createGroup: async (req, res) =>{
        try{
            const result = await groupService.createGroup(req.body, req.user._id);
            if(result.success){
                res.status(201).json({
                    success: true,
                    data: result.data
                });
            } else{
                res.status(400).json({
                    success: false, 
                    errors: ["Create group failed"]
                });
            }
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
            if(result.success){
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else{
                res.status(400).json({
                    success: false,
                    errors: ["Cannot find groups for user"]
                });
            }
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

            if(result.success){
                res.status(200).json({  
                    success: true,
                    data: result.data
                });
            } else{
                res.status(404).json({
                    success: false,
                    errors: ["Group not found or access denied"]
                });
            }
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    updateGroup: async(req, res) => {
        try{
            const result = await groupService.updateGroup(req.user.role, req.user._id, req.params.groupId, req.body);

            if(result.success){
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else{
                const statusCode = result.errors && result.errors.includes('Permission denied') ? 403 : 400;
                res.status(statusCode).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    deleteGroup: async(req, res) =>{
        try{
            const result = await groupService.deleteGroup(req.user.role, req.user._id, req.params.groupId);
            if(result.success){
                res.json({
                    success: true,
                    message: result.message
                });
            } else{
                const statusCode = result.errors && result.errors.includes('Permission denied') ? 403 : 404;
                res.status(statusCode).json({
                    success: false,
                    errors: result.errors
                });
            }
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
            if(result.success){
                res.json({
                    success: true,
                    message: result.message
                });
            } else{
                res.status(400).json({
                    success: false,
                    errors: result.errors
                });
            }
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
            if(result.success){
                res.json({
                    success: true,
                    data: result.data
                });
            } else{
                res.status(403).json({
                    success: false,
                    errors: result.errors || ["Admin access required"]
                });
            }
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    setGroupPermissions: async(req, res) => {
        try{
            const groupId = req.params.groupId;
            const targetUserId = req.body.userId;
            const newPermissions = req.body.permissions;

            const result = await groupService.setGroupPermissions(
                groupId,
                req.user._id,
                targetUserId,
                newPermissions
            );

            if(result.success){
                res.status(200).json({
                    success: true,
                    data: result.data,
                    message: "Permissions updated successfully"
                });
            } else{
                const statusCode = result.errors.includes('Permission denied') ? 403 : 400;
                res.status(statusCode).json({
                    success: false,
                    errors: result.errors
                });
            }
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    }
}