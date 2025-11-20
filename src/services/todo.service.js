import { GET_DB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { validateTodo } from '../utils/validators.js';

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
            console.log('Init todos failed!', error.message);
        }
    }

    async _checkGroupMembership(groupId, userId){
        const group = await this.groupCollection.findOne({
            _id: new ObjectId(groupId),
            $or: [
                {'owner_id': new ObjectId(userId)},
                {'members.user_id': new ObjectId(userId)}
            ]
        });
        return group;
    }

    //tao todo cho tung user
    async createTodo(todoData, userId) {
        try {
            if(!this.collection) this.init();

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

        const skip = (page - 1) * limit;

        const todos = await this.collection
            .find({ user_id: new ObjectId(userId), group_id: null })
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

    async getGroupTodos(groupId, userId, userRole){
        try{
            if(!this.collection) this.init();

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

            const todo = await this.collection.findOne({
                _id: new ObjectId(todoId)
            });

            if(!todo){
                return{success: false, errors: 'Todo khong ton tai'};
            }

            let hasPermission = false;

            if(userRole === 'admin'){
                hasPermission = true;
            }

            else if(todo.group_id){
                const group = await this.groupCollection.findOne({
                    _id: todo.group_id
                });
                
                if (!group) {
                    return { success: false, errors: 'Nhom lien ket voi Todo khong ton tai.' };
                }
                
                const userMembership = group.members.find(
                    member => member.user_id.toString() === userId
                );


                if (updateData.completed !== undefined) {
                    // Yêu cầu: User có quyền mới đổi được trạng thái. 
                    if (group.owner_id.toString() === userId) {
                        hasPermission = true;
                    } else if (userMembership && userMembership.role === 'admin') {
                        hasPermission = true;
                    } else {
                        hasPermission = false; 
                    }
                    
                } 
                else {
   
                    if (todo.user_id.toString() === userId) { 
                        hasPermission = true;
                    } else if (group.owner_id.toString() === userId || (userMembership && userMembership.role === 'admin')) {
                        hasPermission = true;
                    }
                }
                
            }
            else{
                hasPermission = todo.user_id.toString() === userId;
            }

            if(!hasPermission){
                return{success: false, errors: 'Ban khong co quyen chinh sua Todo nay'};
            }

            delete updateData._id; 

            const result = await this.collection.findOneAndUpdate(
                {_id: new ObjectId(todoId)},
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

    async getTodoById(todoId, userId) {
        try {
            if(!this.collection) this.init();

            const todo = await this.collection.findOne({
                _id: new ObjectId(todoId),
                user_id: new ObjectId(userId) 
            });

            if (!todo) {
                return { success: false, errors: ["Todo not found"] };
            }

            return {
                success: true,
                data: todo
            };

        } catch (error) {
            console.error("Get todo by id error:", error);
            return { success: false, errors: [error.message] };
        }
    }

    async deleteTodo(todoId, userId, userRole) {
        try {
            if(!this.collection) this.init();

            const todo = await this.collection.findOne({
                _id: new ObjectId(todoId)
            });

            if (!todo) {
                return { success: false, errors: ["Todo khong ton tai"] };
            }

            let hasPermission = false;

            if(userRole ==='admin'){
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
                    member => member.user_id.toString() === userId
                );

                if(group.owner_id.toString() === userId){
                    hasPermission = true;
                } else if(userMembership && userMembership.role === 'admin'){
                    hasPermission = true;
                } else if (todo.user_id.toString() === userId){
                    hasPermission = true;
                }

            }
            else {
                //todo ca nhan: chi chu todo duoc xoa
                hasPermission = todo.user_id.toString() === userId;
            }

            if(!hasPermission){
                return{success: false, errors: 'Ban khong co quyen xoa todo nay'};
            }

            const result = await this.collection.findOneAndDelete({
                _id: new ObjectId(todoId)
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