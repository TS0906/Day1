import GroupModel from "../models/group.js";
import TodoModel from "../models/todo.js";
import InvitationModel from "../models/invitation.js";
import mongoose from "mongoose";
import {USER_ROLES} from "../constants/roles.js";

const {ObjectId} = mongoose.Types;

const createGroup = async (groupData, creatorId) => {
    try{
        if (!groupData.name || groupData.name.trim().length === 0) {
            return { success: false, errors: ["Group name is required."] };
        }
        
        if (!mongoose.Types.ObjectId.isValid(creatorId)) {
            return { success: false, errors: ["Invalid owner ID."] };
        }
        const ownerObjectId = new ObjectId(creatorId);

        const group = await GroupModel.create({
            name: groupData.name.trim(),
            description: groupData.description || '',
            ownerId: ownerObjectId,
            members: [ownerObjectId], 
            permissions: [{
                userId: ownerObjectId,
                canCreateTodo: true,
                canUpdateTodo: true,
                canSetPermission: true
            }],
            isDeleted: false,
        });
        return { success: true, data: group.toJSON() };
    } catch (error) {
        console.error("Error creating group", error);
        throw error;
    }
};

const getGroupByUser = async (userId, userRole) => {
    try{
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return { success: false, errors: ["Invalid user ID."] };
        }
        
        const userObjectId = new ObjectId(userId);
        let query = { isDeleted: false };

        if (userRole !== USER_ROLES.ADMIN) {
            query.members = userObjectId; 
        }

        const groups = await GroupModel.find(query)
            .sort({ createdAt: -1 })
            .lean();
        return { success: true, data: groups };
    } catch (error) {
        console.error("Error retrieving groups for user", error);
        throw error;
    }
};
const getGroupById = async (groupId, userId, userRole) => {
    try{
        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return { success: false, errors: ["Invalid group ID."] };
        }
        const group = await GroupModel.findOne({ _id: new ObjectId(groupId), isDeleted: false })
            .populate('members', 'name email')
            .populate('ownerId', 'name email')
            .lean();
            
        if (!group) return { success: false, errors: ["Group not found."] };
        const isMember = group.members.some(m => m._id.toString() === userId.toString());
        const isOwner = group.ownerId._id.toString() === userId.toString();

        if (!isMember && !isOwner && userRole !== 'admin') {
            return { success: false, errors: ["Access denied."] };
        }
        return { success: true, data: group };
    } catch (error) {
        console.error("Error retrieving group by ID", error);
        throw error;
    }
};
const updateGroup = async (groupId, updateData, userId, userRole) => {
    try{
        if(!mongoose.Types.ObjectId.isValid(groupId)){
            return {success: false, errors: ["Invalid group ID."]};
        }
        const groupObjectId = new ObjectId(groupId);
        const userObjectId = new ObjectId(userId);
        let query = { _id: groupObjectId, isDeleted: false };
        if (userRole !== USER_ROLES.ADMIN) {
            const group = await GroupModel.findOne(query);
            if (!group) return { success: false, errors: ["Group not found."] };
            const isOwner = group.ownerId.equals(userObjectId);
            const userPerm = group.permissions.find(p => p.userId.equals(userObjectId));
            const hasPerm = userPerm?.canSetPermission;
            if (!isOwner && !hasPerm) return { success: false, errors: ["Access denied."] };
        }
        const updateFields = {};
        if (updateData.name) updateFields.name = updateData.name.trim();
        if (updateData.description !== undefined) updateFields.description = updateData.description;
        const result = await GroupModel.findOneAndUpdate(query, { $set: updateFields }, { new: true, lean: true });
        return { success: true, data: result };
    } catch(error){
        console.error("Error updating group", error);
        throw error;
    }
};
const deleteGroup = async (groupId, userId, userRole) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(groupId)) return { success: false, errors: ['Invalid group ID'] };
        
        const groupObjectId = new ObjectId(groupId);
        let query = { _id: groupObjectId, isDeleted: false };
        if (userRole !== USER_ROLES.ADMIN) {
            query.ownerId = new ObjectId(userId);
        }
        const result = await GroupModel.findOneAndUpdate(
            query,
            { $set: { isDeleted: true } },
            { new: true, lean: true }
        );
        if (!result) {
            return { success: false, errors: ['Permission denied or group not found'] };
        }
        await TodoModel.updateMany({ groupId: groupObjectId }, { $set: { isDeleted: true } });
        return { success: true, message: 'Group deleted successfully' };
    } catch (error) {
        console.error("Error deleting group:", error);
        throw error;
    }
};
const leaveGroup = async (groupId, userId) => {
    try{
        if (!mongoose.Types.ObjectId.isValid(groupId)) return { success: false, errors: ["Invalid group ID."] };
        
        const groupObjectId = new ObjectId(groupId);
        const userObjectId = new ObjectId(userId);

        const group = await GroupModel.findOne({ _id: groupObjectId, members: userObjectId });
        if (!group) return { success: false, errors: ["User is not a member."] };
        
        if (group.ownerId.equals(userObjectId)) {
            return { success: false, errors: ["Group owner cannot leave the group."] };
        }

        const result = await GroupModel.findOneAndUpdate(
            { _id: groupObjectId },
            { $pull: { members: userObjectId } },
            { new: true, lean: true }
        );
        return { success: true, message: "Left group successfully." };
    } catch(error){
        console.error("Error leaving group:", error);
        throw error;
    }
};
const setGroupPermissions = async (groupId, currentUserId, targetUserId, newPermissions) => {
    try{
        if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return { success: false, errors: ["Invalid ID."] };
        }
        const groupObjectId = new ObjectId(groupId);
        const targetObjectId = new ObjectId(targetUserId);

        const permissionObject = {
            userId: targetObjectId,
            canCreateTodo: !!newPermissions.canCreateTodo,
            canUpdateTodo: !!newPermissions.canUpdateTodo,
            canSetPermission: !!newPermissions.canSetPermission,
        };

        const updateExisting = await GroupModel.updateOne(
            { _id: groupObjectId, 'permissions.userId': targetObjectId },
            { $set: { 'permissions.$': permissionObject } } 
        );
        if (updateExisting.matchedCount === 0) {
            await GroupModel.updateOne(
                { _id: groupObjectId },
                { $push: { permissions: permissionObject } } 
            );
        }      
        return { success: true, data: null };
    } catch(error){
        console.error("Error setting group permissions", error);
        throw error;
    }
};

export const groupService = {
    createGroup,
    getGroupByUser,
    getGroupById,
    updateGroup,
    deleteGroup,
    leaveGroup,
    getAllGroups: (role) => {
        if (role !== USER_ROLES.ADMIN) return { success: false, errors: ["Access denied"] };
        return GroupModel.find({ isDeleted: false }).sort({ createdAt: -1 }).lean().then(data => ({ success: true, data }));
    }, setGroupPermissions,
};