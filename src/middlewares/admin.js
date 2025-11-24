import { USER_ROLES } from '../constants/roles.js';

export const requireAdmin = (req, res, next) => {
    try {
        if(!req.user || !req.user.role){
            return res.status(401).json({
                success: false,
                error: "Chua dang nhap hoac thieu thong tin user"          
            })
        } 
        if(req.user.role !== USER_ROLES.ADMIN){
            return res.status(403).json({
                success: false,
                error: "Khong co quyen admin"
            })
        }

        next();
    }catch(error){
        res.status(500).json({
            success: false,
            error: "Loi server"
        })
    }
}

export const requireGroupAdmin = async (req, res, next ) =>{
    try{
        const groupId = req.params.id || req.params.groupId;
        const userId = req.userId;

        const { groupService } = await import('../services/group.service.js');

        const groupResult = await groupService.getGroupById(groupId, userId, req.userRole);

        if(!groupResult.success){
            return res.status(404).json({
                success: false,
                error: "Nhom khong ton tai hoac ban khong co quyen truy cap nhom nay"
            });
        }

        const groupData = groupResult.data;

        const isOwner = groupData.owner_id.toString() === userId;

        const userIsGroupAdmin = groupData.members.find(m=>
            m.user_id.toString() === userId && m.role === 'admin'
        );

        if(!isOwner && !userIsGroupAdmin){
            return res.status(403).json({
                success: false,
                error: "Khong co quyen Admin hoac Owner"
            })
        }
        req.group = groupData;
        next();
    }catch(error){
        return res.status(500).json({
            success: false,
            error: "Loi Server"
        })
    }
}