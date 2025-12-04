import { USER_ROLES } from '../constants/roles.js';
import { ObjectId } from 'mongodb';
import GroupModel from '../models/group.js';

export const authorizeRole = (roles = []) => (req, res, next) => {
    try {
        if(!req.user || !req.user.role){
            return res.status(401).json({
                success: false,
                error: "Authentication required"          
            })
        } 
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success: false,
                error: "Permission denied: Insufficient role access"
            });
        }
        req.userRole = req.user.role;
        next();
    }catch(error){
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

        if(!groupId || !ObjectId.isValid(groupId) || !ObjectId.isValid(userId)){
            return res.status(400).json({success: false, error: "Invalid ID provided."});
        }
        const group = await GroupModel.findOne({_id: new ObjectId(groupId)}).lean();

        if(!group || group.isDeleted){
            return res.status(404).json({
                success: false,
                error: "Group not found"
            });
        }
        const userObjectId = new ObjectId(userId);
        if(requiredPermission === 'isMember'){
            const isMember = group.members.some(memberId => memberId.equals(userObjectId));
            if(!isMember){
                return res.status(403).json({success: false, error: "Permission denied: Not a member of this group"});
            }
            req.group = group; 
            return next();
        }
        const isOwner = group.ownerId.equals(userObjectId);
        if (isOwner || req.user.role === USER_ROLES.ADMIN) {
             req.group = group; 
             return next();
        }
        const userPermissions = group.permissions.find(p => p.userId.equals(userObjectId));        
        const hasRequiredPermission = (userPermissions && userPermissions[requiredPermission] === true);       
        if(!hasRequiredPermission){
            return res.status(403).json({
                success: false,
                error: `Permission denied: Required capability (${requiredPermission}) missing`
            });
        }
        req.group = group;
        next();
    }catch(error){
        console.error("Middleware error: ", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        })
    }
}