import { GET_DB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { validateTodo } from '../utils/validators.js';
import { USER_ROLES } from '../constants/roles.js';

class TodoService {
    constructor() {
        this.db = null;
        this.collection = null;
        this.groupCollection = null;
    }

    init(){
        try{
            this.db = GET_DB();
            this.collection = this.db.collection('todos');
            this.groupCollection = this.db.collection('groups');
        } catch(error){
            console.log('Tao todo loi', error.message);
        }
    }

    async _checkGroupMembership(groupId, userId){
        if(!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)) return null;
        const group = await this.groupCollection.findOne({
            _id: new ObjectId(groupId),
            $or: [
                {'ownerId': new ObjectId(userId)},
                {'members.user_id': new ObjectId(userId)}
            ]
        });
        return group;
    }

    //tao todo cho tung user
    async createTodo(todoData, userId) {
        try {
            if(!this.collection) this.init();

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const validation = validateTodo(todoData);
            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const todo = {
                title: todoData.title.trim(),
                description: todoData.description || '',
                completed: false,
                user_id: new ObjectId(userId), 
                created_at: new Date(),
                updated_at: new Date(),
                group_id: null
            };

            const result = await this.collection.insertOne(todo);
            
            return {
                success: true,
                data: {
                    ...todo,
                    _id: result.insertedId
                }
            };

        } catch (error) {
            return { success: false, errors: [error.message] };
        }
    }
//tao todo cho group by user
    async createGroupTodo(todoData, groupId, userId){
        try{
            if(!this.collection) this.init();

            if(!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const validation = validateTodo(todoData);
            if(!validation.isValid){
                return {success: false, errors: validation.errors};
            }

            const group = await this._checkGroupMembership(groupId, userId);
            if(!group){
                return {success: false, errors: ['Ban khong phai la thanh vien cua group']}
            }

            const todo = {
                title: todoData.title.trim(),
                description: todoData.description || '',
                completed: false,
                user_id: new ObjectId(userId),
                group_id: new ObjectId(groupId),
                created_at: new Date(),
                updated_at: new Date()
            }
            const result = await this.collection.insertOne(todo);

            return{
                success: true,
                data: {...todo, _id: result.insertedId}
            };
        }catch(error){
            return{success: false, errors: [error.message]};
        }
    }


    async getTodosByUserId(userId, page = 1, limit = 10) {
        try {
            if (!this.collection) this.init();

            if(!ObjectId.isValid(userId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const userIdObject = new ObjectId(userId);
            const skip = (page - 1) * limit;

            const todos = await this.collection
                .find({ user_id: userIdObject, group_id: null })
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await this.collection.countDocuments({
                user_id: new ObjectId(userId),
                group_id: null
            });

            return {
                success: true,
                data: {
                    todos,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            };

        } catch (error) {
            return { success: false, errors: [error.message] };
        }
    }

    async getGroupTodos(groupId, userId){
        try{
            if(!this.collection) this.init();

            if(!ObjectId.isValid(userId) || !ObjectId.isValid(groupId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const group = await this._checkGroupMembership(groupId, userId);
            if(!group){
                return {success: false, errors: ["Ban khong co quyen truy cap todo nhom nay"]};
            }

            const todos = await this.collection
                .find({group_id: new ObjectId(groupId)})
                .sort({created_at: -1})
                .toArray();
            
            return {success: true, data: todos};
        }catch(error){
            return {success: false, errors: [error.message]};
        }
    }

    async updateTodo(todoId, userId, userRole, updateData){
        try{
            if(!this.collection) this.init();

            if(!ObjectId.isValid(userId) || !ObjectId.isValid(todoId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const userIdObject = new ObjectId(userId);
            const todoObjectId = new ObjectId(todoId);

            const todo = await this.collection.findOne({
                _id: todoObjectId
            });

            if(!todo){
                return {success: false, errors: ['Todo khong ton tai']};
            }

            let hasPermission = false;

            if(todo.group_id){
                const group = await this.groupCollection.findOne({_id: todo.group_id});

                if(!group){
                    return {success: false, errors: 'Nhom lien ket voi Todo khong ton tai'};
                }

                const userMembership = group.members.find(
                    member => member.user_id.equals(userIdObject)
                );

                if(updateData.completed !== undefined){ //updateStatus: chi owner hoac admin
                    if(group.owner_id.equals(userIdObject)){
                        hasPermission = true;
                    }else if(userMembership && userMembership.role === USER_ROLES.ADMIN){
                        hasPermission = true;
                    } else{
                        hasPermission = false;
                    }                 
                } else{
                    if(todo.user_id.equals(userIdObject)){
                        hasPermission = true;
                    } else if(group.owner_id.equals(userIdObject) || (userMembership && userMembership.role === USER_ROLES.ADMIN)){
                        hasPermission = true;
                    }
                }
            }else{
                hasPermission = todo.user_id.equals(userIdObject);
            }

            if(!hasPermission){
                return{success: false, errors: 'Ban khong co quyen chinh sua Todo nay'};
            }

            delete updateData._id; 
            delete updateData.user._id;

            const result = await this.collection.findOneAndUpdate(
                {_id: todoObjectId},
                {
                    $set: {
                        ...updateData,
                        updated_at: new Date()
                    }
                },
                {returnDocument: 'after'}
            );

            return{success: true, data: result.value};
        }catch(error){
            return{success: false, errors: [error.message]};
        }
    }

    async getTodoById(todoId, userId, userRole) {
        try {
            if(!this.collection) this.init()

            if(!ObjectId.isValid(userId) || !ObjectId.isValid(todoId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const todoObjectId = new ObjectId(todoId);
            const userIdObject = new ObjectId(userId);

            const todo = await this.collection.findOne({_id: todoObjectId});

            if (!todo) {
                return { success: false, errors: ["Todo khong tim thay"] };
            }

            let hasPermission = false;

            if(userRole === USER_ROLES.ADMIN){
                hasPermission = true;
            }

            else if(todo.group_id){
                const group = await this._checkGroupMembership(todo.group_id.toString(), userId);
                hasPermission = !!group;
            }

            else{
                hasPermission = todo.user_id.equals(userIdObject);
            }

            if(!hasPermission){
                return {success: false, errors: ["Khong co quyen truy cap todo nay"]};
            }

            return {
                success: true,
                data: todo
            };

        } catch (error) {
            return { success: false, errors: [error.message] };
        }
    }

    async deleteTodo(todoId, userId, userRole) {
        try {
            if(!this.collection) this.init();

            if(!ObjectId.isValid(userId) || !ObjectId.isValid(todoId)){
                return {success: false, errors: ['ID khong hop le']};
            }

            const todoObjectId = new ObjectId(todoId);
            const userIdObject = new ObjectId(userId);

            const todo = await this.collection.findOne({
                _id: todoObjectId
            });

            if (!todo) {
                return { success: false, errors: ["Todo khong ton tai"] };
            }

            let hasPermission = false;

            if(userRole ===USER_ROLES.ADMIN){
                hasPermission = true;
            }

            else if(todo.group_id){
                //chi admin hoac nguoi tao nhom xoa
                const group = await this.groupCollection.findOne({
                    _id: todo.group_id
                });
                if(!group){
                    return {success: false, errors: 'Nhom lien ket voi Todo khong ton tai.'};
                }

                const userMembership = group.members.find(
                    member => member.user_id.equals(userIdObject)
                );

                if(group.owner_id.equals(userIdObject)){
                    hasPermission = true;
                } else if(userMembership && userMembership.role === USER_ROLES.ADMIN){
                    hasPermission = true;
                } else if (todo.user_id.equals(userIdObject)){
                    hasPermission = true;
                }

            }
            else {
                //todo ca nhan: chi chu todo duoc xoa
                hasPermission = todo.user_id.equals(userIdObject);
            }

            if(!hasPermission){
                return{success: false, errors: 'Ban khong co quyen xoa todo nay'};
            }

            const result = await this.collection.findOneAndDelete({
                _id: todoObjectId
            });

            if(!result.value){
                return {success: false, errors: ["Todo khong ton tai hoac da bi xoa truoc do."]};
            }

            return {
                success: true,
                message: "Todo da xoa thanh cong."
            };

        } catch (error) {
            console.error("Khong xoa duoc Todo:", error);
            return { success: false, errors: [error.message] };
        }
    }
}

export const todoService = new TodoService();