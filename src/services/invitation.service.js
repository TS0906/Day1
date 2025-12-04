import UserModel from "../models/user.js";
import GroupModel from "../models/group.js";
import InvitationModel from "../models/invitation.js";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { validateInvitation } from "../utils/validators.js";
import { USER_ROLES } from "../constants/roles.js";

const createInvitation = async (invitationData, inviterId) => {
    try{
        const { groupId, inviteeEmail } = invitationData;
        if(!ObjectId.isValid(inviterId)|| !ObjectId.isValid(groupId)){
            return {success: false, errors: ["Invalid ID provided."]};
        }

        const groupObjectId = new ObjectId(groupId);
        const inviterObjectId = new ObjectId(inviterId);
        const invitedUser = await UserModel.findOne({ email: inviteeEmail.toLowerCase() });
        const invitedUserId = invitedUser ? invitedUser._id : null;
        const validation = validateInvitation({email: inviteeEmail});
        if(!validation.isValid){
            return {success: false, errors: validation.errors};
        }
        const group = await GroupModel.findOne({_id: groupObjectId, isDeleted: false});
        if(!group){
            return {success: false, errors: ["Group not found."]};
        }
        if(invitedUserId){
            const isMember = group.members.some(m => m.equals(invitedUserId));
            if(isMember){
                return {success: false, errors: ["User is already a member of the group."]};
            }
        }
        const existingInvitation = await InvitationModel.findOne({
            groupId: groupObjectId,
            inviteeEmail: inviteeEmail.toLowerCase(),
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if(existingInvitation){
            return {success: false, errors: ["User has already been invited to this group."]};
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7*24*60*60*1000); // 7 days from now

        const invitation = {
            groupId: groupObjectId,
            inviterId: inviterObjectId,
            invitedUserId: invitedUserId, 
            inviteeEmail: inviteeEmail.toLowerCase(),
            token: token,
            expiresAt: expiresAt
        };
        const inviter = await UserModel.findOne({_id: inviterObjectId}).select('name');
        return {success: true, data: {
                ...invitation.toJSON(),
                groupName: group.name,
                inviterName: inviter ? inviter.name : 'Unknown'
            }
        };
    }catch(error){
        console.error("Error creating invitation", error);
        throw error;
    }
};
const getInvitationsByUser = async (userId) => {
    try{
        if(!ObjectId.isValid(userId)){
            return {success: false, errors: ["Invalid user ID."]};
        }
        const userObjectId = new ObjectId(userId);
        const user = await UserModel.findOne({_id: userObjectId});
        if(!user){
            return {success: false, errors: ["User not found."]};
        }
        const invitations = await InvitationModel
            .aggregate([{
                $match: {
                    $or:[
                        {invitedUserId: userObjectId},
                        {inviteeEmail: user.email}
                    ],
                    status: 'pending',
                    expiresAt: { $gt: new Date() },
                    isDeleted: false
                }
            },
            {$lookup: {from: 'groups', localField: 'groupId', foreignField: '_id', as: 'groupInfo'}},
            { $lookup: { from: 'users', localField: 'inviterId', foreignField: '_id', as: 'inviter' } },
            { $unwind: '$groupInfo' },
            { $unwind: { path: '$inviter', preserveNullAndEmptyArrays: true } }, 
            { $project: {
                _id: 1, token: 1, status: 1, expiresAt: 1, createdAt: 1,
                groupId: '$groupInfo._id',
                groupName: '$groupInfo.name',
                inviterName: '$inviter.name',
                inviterEmail: '$inviter.email'
            }},
            { $sort: { createdAt: -1 } }
            ]).lean();
        return {success: true, data: invitations};
    } catch(error){
        console.error("Error retrieving invitations", error);
        throw error;
    }
};
const acceptInvitation = async (token, userId) => {
    try{
        if(!ObjectId.isValid(userId)){
            return {success: false, errors: ["Invalid user ID."]};
        }
        const userObjectId = new ObjectId(userId);
        const invitation = await InvitationModel.findOne({token: token, status: 'pending', expiresAt: { $gt: new Date() }});
        if(!invitation){
            return {success: false, errors: ["Invitation not found or has expired."]};
        }
        const user = await UserModel.findOne({_id: userObjectId});
        if(!user || (invitation.invitedUserId && !invitation.invitedUserId.equals(userObjectId) && invitation.inviteeEmail !== user.email)){
            return {success: false, errors: ["You are not authorized to accept this invitation."]};
        }
        const existingGroup = await GroupModel.findOne({_id: invitation.groupId, members: userObjectId});

        if(existingGroup){
            await InvitationModel.updateOne(
                {_id: invitation._id},
                {$set: {status: 'accepted', updatedAt: new Date()}}
            );
            return {success: true, message: "You are already a member of this group."};
        }
        const updateResult = await GroupModel.updateOne(
            {_id: invitation.groupId},
            {
                $addToSet: { members: userObjectId },
            }
        );
        if(updateResult.modifiedCount === 0){
            return {success: false, errors: ["Failed to add you to the group (Group may have been deleted)."]}
        }
        await InvitationModel.updateOne(
            {_id: invitation._id},
            {$set: {status: 'accepted', acceptedAt: new Date()}}
        );
        return {success: true, message: "Successfully joined the group."};
    } catch(error){
        console.error("Error accepting invitation", error);
        throw error;
    }
};
const rejectInvitation = async (token, userId) => {
    try{
        if(!ObjectId.isValid(userId)){
            return {success: false, errors: ["Invalid user ID."]};
        }
        const userObjectId = new ObjectId(userId);
        const invitation = await InvitationModel.findOne({token: token, status: 'pending'});
        if(!invitation){
            return {success: false, errors: ["Invitation not found."]};
        }
        const user = await UserModel.findOne({_id: userObjectId});
        if(!user || (invitation.invitedUserId && !invitation.invitedUserId.equals(userObjectId) && invitation.inviteeEmail !== user.email)){
            return {success: false, errors: ["You are not authorized to reject this invitation."]};
        }
        await InvitationModel.updateOne(
            {_id: invitation._id},
            {$set: {status: 'rejected', rejectedAt: new Date()}}
        );
        return {success: true, message: "Invitation rejected successfully."};
    } catch(error){
        console.error("Error rejecting invitation", error);
        throw error;
    }
}
const cancelInvitation = async (invitationId, userId, userRole) => {
    try{
        if(!ObjectId.isValid(invitationId) || !ObjectId.isValid(userId)){
            return {success: false, errors: ["Invalid ID provided."]};
        }
        const invitationObjectId = new ObjectId(invitationId);
        const userObjectId = new ObjectId(userId);
        const invitation = await InvitationModel.findOne({_id: invitationObjectId, status: 'pending'});
        if(!invitation){
            return {success: false, errors: ["Invitation not found or already processed."]};
        }
        let hasPermission = (userRole === USER_ROLES.ADMIN);
        
        if(!hasPermission){
            const group = await GroupModel.findOne({_id: invitation.groupId});
            const isOwner = group?.ownerId.equals(userObjectId);
            const isInviter = invitation.inviterId.equals(userObjectId);
            if(!isOwner && !isInviter){
                return {success: false, errors: ["Permission denied."]};
            }
        }
        await InvitationModel.updateOne(
            {_id: invitation._id},
            {$set: {status: 'cancelled', cancelledAt: new Date()}}
        );  
        return {success: true, message: "Invitation cancelled successfully."};
    } catch(error){
        console.error("Error cancelling invitation", error);
        throw error;
    }
}

export const invitationService = {
    createInvitation,
    getInvitationsByUser,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation
};