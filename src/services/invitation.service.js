import { GET_DB } from "../config/db.js";
import { ObjectId } from "mongodb";
import crypto from 'crypto';
import { validateInvitation } from "../utils/validators.js";
import { USER_ROLES } from "../constants/roles.js";

class InvitationService{
    constructor(){
        this.db = null;
        this.invitationCollection = null;
        this.userCollection = null;
        this.groupCollection = null;
    }
    
    init(){
        try{
            this.db = GET_DB();
            this.invitationCollection = this.db.collection('invitations');
            this.userCollection = this.db.collection('users');
            this.groupCollection = this.db.collection('groups');
        } catch(error){
            console.error('Invitation init failed!', error.message);
        }
    }

    async createInvitation(groupId, inviterId, inviteeEmail){
        try{
            if(!this.invitationCollection) this.init();

            if(!ObjectId.isValid(inviterId) || !ObjectId.isValid(groupId)){
                return {success: false, errors: ['ID khong hop le']}
            }

            const groupObjectId = new ObjectId(groupId);
            const inviterObjectId = new ObjectId(inviterId);

            const validation = validateInvitation({email: inviteeEmail});
            if(!validation.isValid){
                return {success: false, errors: validation.errors};
            }

            const group = await this.groupCollection.findOne({
                _id: new ObjectId(groupId),
                $or: [
                    {owner_id: inviterObjectId},
                    {'members.user_id': inviterObjectId, 'members.role': 'admin'}
                ]
            });

            if (!group) {
                return { success: false, errors: ['Khong co quyen moi vao nhom nay'] };
            }

            const existingUser = await this.userCollection.findOne({
                email: inviteeEmail.toLowerCase()
            });

            if(existingUser){
                const isMember = group.members.some(m =>
                    m.user_id.equals(existingUser._id)
                );
                if(isMember){
                    return {success: false, errors: ['Nguoi dung da o trong nhom']};
                }
            }

            const existingInvitation = await this.invitationCollection.findOne({
                group_id: new ObjectId(groupId),
                invitee_email: inviteeEmail.toLowerCase(),
                status: 'pending',
                expires_at: {$gt: new Date()}
            });

            if(existingInvitation){
                return{
                    success: false,
                    errors: ['Nguoi dung da duoc moi']
                };
            }

            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 7*24*60*60*1000); // 7days

            const invitation = {
                group_id: new ObjectId(groupId),
                inviter_id: new ObjectId(inviterId),
                invitee_email: inviteeEmail.toLowerCase(),
                token: token,
                status: 'pending',
                expires_at: expiresAt,
                created_at: new Date()
            };

            const result = await this.invitationCollection.insertOne(invitation);

            const inviter = await this.userCollection.findOne(
                { _id: new ObjectId(inviterId) },
                { projection: { name: 1 } }
            );

            return{
                success: true,
                data: {
                    ...invitation,
                    _id: result.insertedId,
                    group_name: group.name,
                    inviter_name: inviter?.name || 'Unknown'
                }
            };
        }catch(error){
            console.error("Khong the tao invitation:", error);
            return{
                success: false,
                errors: [error.message]
            };
        }
    }

    async getInvitationsByUser(userEmail){
        try{
            if(!this.invitationCollection) this.init();

            const invitations = await this.invitationCollection
                .aggregate([
                    {
                        $match: {
                            invitee_email: userEmail.toLowerCase(),
                            status: 'pending',
                            expires_at: {$gt: new Date()}
                        }
                    },
                    {
                        $lookup: {
                            from: 'groups',
                            localField: 'group_id',
                            foreignField: '_id',
                            as: 'group'
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'inviter_id',
                            foreignField: '_id',
                            as: 'inviter'
                        }
                    },
                    {
                        $unwind: '$group'
                    },
                    {
                        $unwind: '$inviter'
                    },
                    {
                        $project: {
                            '_id': 1,
                            'token': 1,
                            'status': 1,
                            'expires_at': 1,
                            'created_at': 1,
                            'group._id': 1,
                            'group.name': 1,
                            'group.description': 1,
                            'inviter.name': 1,
                            'inviter.email': 1
                        }
                    },
                    {
                        $sort: { created_at: -1 }
                    }
                ])
                .toArray();
            return { success: true, data: invitations };
        }catch(error){
            console.error("Không lấy được invitations:", error);
            return { success: false, errors: [error.message] };
        }
    }

    async acceptInvitation(token, userId){
        try{
            if(!this.invitationCollection) this.init();

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const userObjectId = new ObjectId(userId);

            const invitation = await this.invitationCollection.findOne({
                token: token,
                status: 'pending',
                expires_at: {$gt: new Date()}
            });

            if(!invitation){
                return { success: false, errors: ['Loi moi khong ton tai hoac het han'] };
            }

            const user = await this.userCollection.findOne({
                _id: userObjectId
            });

            if(!user || user.email !== invitation.invitee_email){
                return { success: false, errors: ['Loi moi khong danh cho ban'] };
            }

            const existingGroup = await this.groupCollection.findOne({
                _id: invitation.group_id,
                'members.user_id': userObjectId
            });

            if (existingGroup) {
                await this.invitationCollection.updateOne(
                    { _id: invitation._id },
                    { $set: { status: 'accepted' } }
                );
                return { success: true, message: 'Ban da o trong nhom nay' };
            }

            const updateResult = await this.groupCollection.updateOne(
                { _id: invitation.group_id },
                {
                    $addToSet: {
                        members: {
                            user_id: userObjectId,
                            role: 'member',
                            joined_at: new Date()
                        }
                    }
                }
            );

            if (updateResult.modifiedCount === 0) {
                return { success: false, errors: ['Khong the them vao nhom'] };
            }

            await this.invitationCollection.updateOne(
                { _id: invitation._id },
                { $set: { status: 'accepted' } }
            );

            return { success: true, message: "Da tham gia nhom thanh cong" };
        } catch(error){
            console.error("Chap nhan loi moi khong thanh cong ", error);
            return { success: false, errors: [error.message] };
        }
    }

    async rejectInvitation(token, userId){
        try{
            if(!this.invitationCollection) this.init(); 

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID nguoi dung khong hop le']};
            }

            const userObjectId = new ObjectId(userId);

            const invitation = await this.invitationCollection.findOne({
                token: token,
                status: 'pending'
            });

            if(!invitation){
                return { success: false, errors: ['Loi moi khong hop le'] };
            }

            const user = await this.userCollection.findOne({
                _id: userObjectId
            });

            if(!user || user.email !== invitation.invitee_email){
                return { success: false, errors: ['Ban khong duoc moi'] };
            }

            await this.invitationCollection.updateOne(
                { _id: invitation._id },
                { $set: { status: 'rejected' } }
            );

            return { success: true, message: "Da tu choi loi moi" };
        } catch(error){
            console.error("Khong the tu choi loi moi", error);
            return { success: false, errors: [error.message] };
        }
    }

    async cancelInvitation(invitationId, userId, userRole){
        try{
            if(!this.invitationCollection) this.init();

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const invitationObjectId = new ObjectId(invitationId);
            const userObjectId = new ObjectId(userId);

            const invitation = await this.invitationCollection.findOne({
                _id: new invitationObjectId
            });

            if(!invitation){
                return { success: false, errors: ['Loi moi khong ton tai'] };
            }

            let hasPermission = false;

            if(userRole === USER_ROLES.ADMIN){
                hasPermission = true;
            } else{
                const group = await this.groupCollection.findOne({
                    _id: invitation.group_id, 
                    $or: [
                        {owner_id: userObjectId},
                        {'members.user_id': userObjectId, 'members.role': 'admin'}
                    ]
                });
                hasPermission = !!group || invitation.inviter_id.equals(userObjectId);
            }

            if(!hasPermission){
                return { success: false, errors: ['Ban khong co quyen huy loi moi'] };
            }

            await this.invitationCollection.updateOne(
                { _id: invitation._id },
                { $set: { status: 'cancelled' } }
            );

            return { success: true, message: "Da huy loi moi thanh cong" };
        } catch(error){
            console.error("Khong cancel duoc loi moi", error);
            return { success: false, errors: [error.message] };
        }
    }
}

export const invitationService = new InvitationService();