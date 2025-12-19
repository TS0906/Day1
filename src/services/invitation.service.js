import UserModel from "../models/user.js";
import GroupModel from "../models/group.js";
import InvitationModel from "../models/invitation.js";
import mongoose from "mongoose"; 
import crypto from "crypto";
import { validateInvitation } from "../utils/validators.js";

const { ObjectId } = mongoose.Types; 

const createInvitation = async (invitationData, inviterId) => {
    try {
        const { groupId, inviteeEmail } = invitationData;
        
        if (!ObjectId.isValid(inviterId) || !ObjectId.isValid(groupId)) {
            return { success: false, errors: ["Invalid ID provided."] };
        }
        
        const groupObjectId = new ObjectId(groupId);
        const inviterObjectId = new ObjectId(inviterId);
        
        const invitedUser = await UserModel.findOne({ email: inviteeEmail.toLowerCase() });
        const invitedUserId = invitedUser ? invitedUser._id : null;
        
        const validation = validateInvitation({ email: inviteeEmail });
        if (!validation.isValid) return { success: false, errors: validation.errors };

        const group = await GroupModel.findOne({ _id: groupObjectId, isDeleted: false });
        if (!group) return { success: false, errors: ["Group not found."] };

        if (invitedUserId) {
            const isMember = group.members.some(m => 
                m.userId ? m.userId.equals(invitedUserId) : m.equals(invitedUserId)
            );
            if (isMember) return { success: false, errors: ["User is already a member."] };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const invitation = await InvitationModel.create({
            groupId: groupObjectId,
            inviterId: inviterObjectId,
            invitedUserId: invitedUserId,
            inviteeEmail: inviteeEmail.toLowerCase(),
            token: token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            isDeleted: false
        });

        return { success: true, data: invitation.toJSON() };
    } catch (error) {
        console.error("Error creating invitation", error);
        throw error;
    }
};

const getInvitationsByUser = async (userId) => {
    try {
        if (!ObjectId.isValid(userId)) return { success: false, errors: ["Invalid user ID."] };
        
        const userObjectId = new ObjectId(userId);
        const user = await UserModel.findById(userObjectId);
        if (!user) return { success: false, errors: ["User not found."] };

        const invitations = await InvitationModel.aggregate([
            {
                $match: {
                    $or: [
                        { invitedUserId: userObjectId },
                        { inviteeEmail: user.email.toLowerCase() }
                    ],
                    status: 'pending',
                    expiresAt: { $gt: new Date() },
                    isDeleted: false
                }
            },
            { $lookup: { from: 'groups', localField: 'groupId', foreignField: '_id', as: 'groupInfo' } },
            { $lookup: { from: 'users', localField: 'inviterId', foreignField: '_id', as: 'inviter' } },
            { $unwind: '$groupInfo' },
            { $unwind: { path: '$inviter', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1, token: 1, status: 1, expiresAt: 1, createdAt: 1,
                    groupId: '$groupInfo._id',
                    groupName: '$groupInfo.name',
                    inviterName: '$inviter.name'
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return { success: true, data: invitations };
    } catch (error) {
        console.error("Error retrieving invitations", error);
        throw error;
    }
};

const acceptInvitation = async (token, userId) => {
    try {
        if (!ObjectId.isValid(userId)) return { success: false, errors: ["Invalid user ID."] };
        const userObjectId = new ObjectId(userId);

        const invitation = await InvitationModel.findOne({ token, status: 'pending', expiresAt: { $gt: new Date() } });
        if (!invitation) return { success: false, errors: ["Invitation not found or expired."] };
        const updateResult = await GroupModel.updateOne(
            { _id: invitation.groupId },
            {
                $addToSet:{
                    members: userObjectId
                },
                $push: { 
                    permissions: { 
                        userId: userObjectId, 
                        canCreateTodo: true, 
                        canUpdateTodo: false, 
                        canSetPermission: false 
                    } 
                }
            }
        );

        if (updateResult.modifiedCount === 0) return { success: false, errors: ["Already a member or group deleted."] };
        await InvitationModel.updateOne({_id: invitation._id}, {$set: {status: 'accepted', acceptedAt: new Date()}});
        return { success: true, message: "Successfully joined the group." };
    } catch (error) { throw error; }
};

export const invitationService = {
    createInvitation,
    getInvitationsByUser,
    acceptInvitation,
    rejectInvitation: async (token) => {
        await InvitationModel.updateOne({ token }, { $set: { status: 'rejected', updatedAt: new Date() } });
        return { success: true, message: "Invitation rejected." };
    },
    cancelInvitation: async (id) => {
        await InvitationModel.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'cancelled' } });
        return { success: true, message: "Invitation cancelled." };
    }
};