import GroupModel from "../models/group.js";
import TodoModel from "../models/todo.js";
import InvitationModel from "../models/invitation.js";
import { ObjectId } from "mongodb";
import {USER_ROLES} from "../constants/roles.js";

const createGroup = async (groupData, creatorId) => {
    try{
        if(!groupData.name ||  groupData.name.trim().length === 0){
            return {success: false, errors: ["Group name is required."]};
        }
        if(!ObjectId.isValid(creatorId)){
            return {success: false, errors: ["Invalid owner ID."]};
        }

        const ownerObjectId = new ObjectId(creatorId);

        const group = await GroupModel.create({
            name: groupData.name.trim(),
            description: groupData.description || '',
            ownerId: ownerObjectId,
            members: [ownerObjectId], 
            permissions: [],
            isDeleted: false,
        });
        return {
            success: true,
            data: group.toJSON() 
        };
    }catch(error){
        console.error("Error creating group", error);
        throw error;
    }
};

const getGroupByUser = async (userId, userRole) => {
    try{
        if(!ObjectId.isValid(userId)){
            return {success: false, errors: ["Invalid user ID."]};
        }
        let query = {isDeleted: false};

        if(userRole !== USER_ROLES.ADMIN){
            query.members = userId;
        }

        const groups = await GroupModel.find(query)
            .sort({ createdAt: -1 })
            .lean();
        return {success: true, data: groups};
    }catch(error){
        console.error("Error retrieving groups for user", error);
        throw error;
    }
};
const getGroupById = async (groupId, userId, userRole) => {
    try{
        if(!ObjectId.isValid(groupId)){
            return {success: false, errors: ["Invalid group ID."]};
        }
        let query = {_id: groupId, isDeleted: false};
        const group = await GroupModel.findOne(query).lean();
        if(!group){
            return {success: false, errors: ["Group not found or access denied."]};
        }
        return {success: true, data: group};
    } catch(error){
        console.error("Error retrieving group by ID", error);
        throw error;
    }
};
const updateGroup = async (groupId, updateData, userRole, userId) => {
    try{
        if(!ObjectId.isValid(groupId)){
            return {success: false, errors: ["Invalid group ID."]};
        }
        if(updateData.name && (updateData.name.trim().length === 0 || !updateData.name.trim())){
            return {success: false, errors: ["Group name cannot be empty."]};
        }

        let query = {_id: groupId, isDeleted: false};
        if(userRole !== USER_ROLES.ADMIN){
            if(!ObjectId.isValid(userId)) throw new Error("Invalid userId for query.");
            query.ownerId = userId;
        }

        const updateFields = {};
        if(updateData.name) updateFields.name = updateData.name.trim();
        if(updateData.description !== undefined) updateFields.description = updateData.description;

        const result = await GroupModel.findOneAndUpdate(
            query,
            {$set: updateFields},
            {new: true, lean: true}
        );
        if(!result){
            return {success: false, errors: ["Group not found or access denied."]};
        }
        return {success: true, data: result};
    } catch(error){
        console.error("Error updating group", error);
        throw error;
    }
};
const deleteGroup = async (userRole, userId, groupId) => {
    try {
        if (!ObjectId.isValid(groupId)) return { success: false, errors: ['Invalid group ID'] };
        
        let query = { _id: groupId, isDeleted: false };
        if (userRole !== USER_ROLES.ADMIN) {
            query.ownerId = userId;
        }
        const result = await GroupModel.findOneAndUpdate(
            query,
            { $set: { isDeleted: true } },
            { new: true, lean: true}
        );

        if (!result) {
            return { success: false, errors: ['Permission denied or group not found'] };
        }
        await TodoModel.updateMany({groupId}, {$set: {isDeleted: true}});
        await InvitationModel.updateMany({groupId}, {$set: {isDeleted: true}});
        return { success: true, message: 'Group deleted successfully' };
    } catch (error) {
        console.error("Error deleting group:", error);
        throw error;
    }
};
const leaveGroup = async (groupId, userId) => {
    try{
        if(!ObjectId.isValid(groupId)) return {success: false, errors: ["Invalid group ID."]};
        if(!ObjectId.isValid(userId)) return {success: false, errors: ["Invalid user ID."]};

        const userObjectId = new ObjectId(userId);
        const group = await GroupModel.findOne({_id: groupId, members: userObjectId});
        if(!group){
            return {success: false, errors: ["User is not a member."]};
        }
        if(group.ownerId.equals(userObjectId)){
            return {success: false, errors: ["Group owner cannot leave the group."]};
        }
        const result = await GroupModel.findOneAndUpdate(
            {_id: groupId},
            {
                $pull: {members: userObjectId}
            },
            {new: true, lean: true}
        );
        if(!result){
            return {success: false, errors: ["Error leaving group."]};
        }
        return {success: true, message: "Left group successfully."};
    } catch(error){
        console.error("Error leaving group:", error);
        throw error;
    }
};
const getAllGroups = async (userRole) => {
    try{
        if(userRole !== USER_ROLES.ADMIN){
            return {success: false, errors: ["Permission denied."]};
        }

        const groups = await GroupModel.find({isDeleted: false}).sort({ createdAt: -1 }).lean();
        return {success: true, data: groups};
    } catch(error){
        console.error("Error retrieving all groups", error);
        throw error;
    }
};
const setGroupPermissions = async (groupId, currentUserId, targetUserId, newPermissions) => {
    try{
        if(!ObjectId.isValid(groupId) || !ObjectId.isValid(targetUserId)){
            return {success: false, errors: ["Invalid group ID."]};
        }
        const targetObjectId = new ObjectId(targetUserId);
        const permissionObject ={
            userId: targetObjectId,
            canCreateTodo: !!newPermissions.canCreateTodo,
            canUpdateTodo: !!newPermissions.canUpdateTodo,
            canSetPermission: !!newPermissions.canSetPermission,
        };
        const updateExisting = await GroupModel.updateOne(
            {_id: groupId, 'permissions.userId': targetObjectId },
            {$set: {'permissions.$': permissionObject}} 
        );
        if(updateExisting.matchedCount === 0){
            await GroupModel.updateOne(
                {_id: groupId},
                {$push: {permissions: permissionObject}} 
            );
        }      
        return {success: true, data: null};
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
    getAllGroups,
    setGroupPermissions
};