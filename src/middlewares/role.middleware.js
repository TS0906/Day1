import { USER_ROLES } from '../constants/roles.js';
import { ObjectId } from 'mongodb';
import GroupModel from '../models/group.js';

export const authorizeRole = (roles = []) => (req, res, next) => {
    try {
        const role = req.user.role;
        if(role === USER_ROLES.ADMIN) return next();
        if(!roles.includes(role)){
            return res.status(403).json({
                success: false,
                error: "Permission denied: Insufficient role access"
            });
        }
        next();
    }catch(error){
        console.error("authorizeRole Error:", error);
        res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}
export const checkGroupPermission = (requiredPermission) => async (req, res, next ) =>{
    try{
        const groupId = req.params.groupId || req.body.groupId;
        const userId = req.user._id;
        if(!ObjectId.isValid(groupId)){
            return res.status(400).json({success: false, error: "Invalid ID provided."});
        }
        const group = await GroupModel.findById(groupId).lean();
        if(!group || group.isDeleted){
            return res.status(404).json({
                success: false,
                error: "Group not found"
            });
        }
        const isOwner = group.ownerId.toString() === userId.toString();
        const isAdmin = req.user.role === USER_ROLES.ADMIN;
        if(isAdmin || isOwner) return next();
        const userPermission = group.permissions.find(p =>
            p.userId.toString() === userId.toString()
        );
        if(!userPermission){
            return res.status(403).json({success: false, error: "No group permission found"});
        }
        if(!(requiredPermission in userPermission)){
            return res.status(500).json({
                success: false,
                error: `Invalid permission key: ${requiredPermission}`
            });
        }
        if(!userPermission[requiredPermission]){
            return res.status(403).json({success: false, error: "Permission denied"});
        }
        next();
    }catch(error){
        console.error("checkGroupPermission error: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};