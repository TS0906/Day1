import { groupService } from "../services/group.service.js";

export const groupController = {
    createGroup: async (req, res) =>{
        try{
            const result = await groupService.createGroup(req.body, req.userId);
            if(result.success){
                res.status(201).json({
                    success: true,
                    data: result.data
                });
            } else{
                res.status(400).json({
                    success: false, 
                    errors: "Tao khong thanh cong"
                });
            }
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Loi"
            })
        }
    },
    getMyGroups: async (req, res) =>{
        try{
            const result = await groupService.getGroupByUser(req.userId, req.userRole);
            if(result.success){
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else{
                res.status(400).json({
                    success: false,
                    errors: "Tim khong thanh cong"
                });
            }
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Loi"
            })
        }
    },
    getGroupById: async(req, res) =>{
        try{
            const result = await groupService.getGroupById(req.params.id, req.userId, req.userRole);

            if(result.success){
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else{
                res.status(404).json({
                    success: false,
                    errors: "Tim khong thanh cong"
                });
            }
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Loi"
            })
        }
    },
    updateGroup: async(req, res) => {
        try{
            const result = await groupService.updateGroup(req.userRole, req.userId, req.params.id, req.body);

            if(result.success){
                res.status(200).json({
                    success: true,
                    data: result.data
                });
            } else{
                res.status(400).json({
                    success: false,
                    errors: "Khong update duoc"
                });
            }
        } catch(error){
            res.status(500).json({
                success: false,
                error: "Loi"
            })
        }
    },
    deleteGroup: async(req, res) =>{
        try{
            const result = await groupService.deleteGroup(req.userRole, req.userId, req.params.id);
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
                error: "Loi"
            })
        }
    },
    leaveGroup: async(req, res) => {
        try{
            const result = await groupService.leaveGroup(req.params.id, req.userId);
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
                error: "Loi"
            })
        }
    },
    getAllGroups: async(req, res) => {
        try{
            const result = await groupService.getAllGroups(req.userRole);
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
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Loi"
            });
        }
    }
}