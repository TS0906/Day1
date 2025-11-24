import { GET_DB } from "../config/db.js";
import { ObjectId } from "mongodb";
import { USER_ROLES } from "../constants/roles.js";

class GroupService{
    constructor(){
        this.db = null;
        this.collection = null;
        this.userCollection = null;
    }

    init(){
        try{
            this.db = GET_DB();
            this.collection = this.db.collection('groups');
            this.userCollection = this.db.collection('users');
        } catch(error){
            console.log("Khoi tao DATABASE that bai");
        }
    }

    async createGroup(groupData, ownerId){
        try{
            if(!this.collection) this.init();

            if(!groupData.name || groupData.name.trim().length === 0){
                return {success: false, errors: ['Nhap ten nhom']};
            }

            if(!ObjectId.isValid(ownerId)){
                return {success: false, errors: ['ID nguoi tao khong hop le']};
            }

            const ownerObjectId = new ObjectId(ownerId);
            
            const group = {
                name: groupData.name.trim(),
                description: groupData.description || '',
                owner_id: ownerObjectId,
                members: [{
                    user_id: ownerObjectId,
                    role: 'admin',
                    joined_at: new Date()
                }],
                created_at: new Date(),
                updated_at: new Date()
            }

            const result = await this.collection.insertOne(group);

            return {
                success: true,
                data: { ...group, _id: result.insertedId}
            };
        }catch(error){
            console.error("Loi tao group", error);
            return {success: false, errors: ['Khong the tao group']};
        }
    }
    async getGroupByUser(userId, userRole = 'user'){
        try{
            if(!this.collection) this.init()

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID nguoi dung khong hop le']};
            }
            
            let query = {};
            const userObjectId = new ObjectId(userId);

            if(userRole === USER_ROLES.ADMIN){
                query = {};
            }
            else{
                query = {
                    $or: [
                        {'owner_id': userObjectId},
                        {'members.user_id': userObjectId}
                    ]
                }
            }

            const groups = await this.collection
                .find(query)
                .sort({created_at: -1})
                .toArray();

            return {success: true, data: groups};
        } catch(error){
            console.error("Loi khi lay group", error);
            return {success: false, errors: ['Loi khi lay danh sach nhom']};
        }
    }
    async getGroupById(groupId, userId, userRole){
        try{
            if(!this.collection) this.init();

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            let query = {_id: new ObjectId(groupId)};
            const userObjectId = new ObjectId(userId);

            if(userRole!== USER_ROLES.ADMIN){
                query.$or =[
                    {'owner_id': userObjectId},
                    {'members.user_id': userObjectId}
                ];
            }

            const group = await this.collection.findOne(query);

            if(!group){
                return {success: false, errors: 'Nhom khong ton tai hoac ban khong co quyen'};
            }

            return {success: true, data: group};
        } catch(error){
            console.error("Loi khi lay group theo ID", error);
            return {success: false, errors: 'Loi'};
        }
    }
    async updateGroup(userRole, userId, groupId, updateData){
        try{
            if(!this.collection) this.init();

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID nhom khong hop le']};
            }

            if(updateData.name &&(!updateData.name.trim() || updateData.name.trim().length === 0))
            {
                return{success: false, errors: ['Ten nhom khong duoc de trong']};
            }
            
            let query = {_id: new ObjectId(groupId)};
            const userObjectId = new ObjectId(userId);

            if(userRole !== USER_ROLES.ADMIN){
                if(!ObjectId.isValid(userId)) return {success: false, errors: ['ID nguoi dung khong hop le']};
                query.owner_id = userObjectId;
            }

            const updateFields = {
                updated_at: new Date()
            };

            if(updateData.name) updateFields.name = updateData.name.trim();
            if(updateData.description !== undefined) updateFields.description = updateData.description;

            const result = await this.collection.findOneAndUpdate(
                query,
                {$set: updateFields},
                {returnDocument: 'after'}
            );

            if(!result.value){
                return {success: false, errors: 'Khong co quyen hoac nhom khong ton tai'};
            }

            return{success: true, data: result.value};
        }catch(error){
            console.error("Loi update group", error);
            return{success: false, errors: 'Update khong duoc'};
        }
    }
    async deleteGroup(userRole, userId, groupId){
        try{
            if(!this.collection) this.init();

            if(!ObjectId.isValid(groupId)){
                return {success: false, errors: ['ID nhom khong hop le']};
            }

            const userObjectId = new ObjectId(userId);

            let query = {_id: new ObjectId(groupId)};

            if(userRole !== USER_ROLES.ADMIN){
                if(!ObjectId.isValid(userId)) return {success: false, errors: ['ID nguoi dung khong hop le']};
                query.owner_id = userObjectId;
            }

            const result = await this.collection.findOneAndDelete(query);

            if(!result.value){
                return{success: false, errors: 'Khong co quyen hoac nhom khong ton tai'};
            }

            return { success: true, message: 'Da xoa nhom thanh cong' };
        } catch(error){
            console.error("Loi delete group", error);
            return{success: false, errors: 'Khong the xoa nhom'}
        }
    }
    async leaveGroup(userId, groupId){
        try{
            if(!this.collection) this.init();

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const userObjectId = new ObjectId(userId);
            const groupObjectId = new ObjectId(groupId);

            const group = await this.collection.findOne({
                _id: groupObjectId,
                'members.user_id': userObjectId
            });

            if(!group){
                return{success: false, errors: 'Ban khong o trong nhom nay'};
            }

            if(group.owner_id.equals(userObjectId)){
                return {success: false, errors: 'Chu nhom khong the roi nhom'};
            }

            const result = await this.collection.findOneAndUpdate(
                {_id: new ObjectId(groupId)},
                {
                    $pull:{
                        members: {user_id: userObjectId}
                    },
                    $set: {updated_at: new Date()}
                },
                {returnDocument: 'after'}
            )
            if(!result.value){
                return {success: false, errors: ['Loi khi roi nhom']};
            }
            return {success: true, message: 'Da roi nhom thanh cong'};
        }catch(error){
            console.error("Loi roi group", error);
            return{success: false, errors: 'Loi'};
        }
    }
    async getAllGroups(userRole ='user'){
        try{
            if(!this.collection) this.init();

            if(userRole !== USER_ROLES.ADMIN){
                return {success: false, errors: ['Khong co quyen truy cap']};
            }

            const groups = await this.collection
                .find({})
                .sort({created_at: -1})
                .toArray()
            
            return{success: true, data: groups};
        } catch(error){
            console.error("Loi lay tat ca groups", error);
            return{success: false, errors: 'Lay du lieu group that bai'};
        }
    }
} 

export const groupService = new GroupService();