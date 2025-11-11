import { GET_DB } from '../config/db.js';
import { ObjectId } from 'mongodb';
import { validateTodo } from '../utils/validators.js';

class TodoService {
    constructor() {
        this.db = null;
        this.collection = null;
    }

    init(){
        this.db = GET_DB();
        this.collection = this.db.collection('todos');
    }
    async createTodo(todoData, userId) {
        try {
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
                updated_at: new Date()
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
            console.error("Create todo error:", error);
            return { success: false, errors: [error.message] };
        }
    }

    async getTodosByUserId(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            
            const todos = await this.collection
                .find({ user_id: new ObjectId(userId) }) 
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await this.collection.countDocuments({ 
                user_id: new ObjectId(userId) 
            });

            return {
                success: true,
                data: todos,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error("Get todos error:", error);
            return { success: false, errors: [error.message] };
        }
    }

    async getTodoById(todoId, userId) {
        try {
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

    async updateTodo(todoId, userId, updateData) {
        try {
            const validation = validateTodo(updateData);
            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const updateFields = {
                ...updateData,
                updated_at: new Date()
            };

            const result = await this.collection.findOneAndUpdate(
                { 
                    _id: new ObjectId(todoId), 
                    user_id: new ObjectId(userId) 
                },
                { $set: updateFields },
                { returnDocument: 'after' }
            );

            if (!result) {
                return { success: false, errors: ["Todo not found"] };
            }

            return {
                success: true,
                data: result
            };

        } catch (error) {
            console.error("Update todo error:", error);
            return { success: false, errors: [error.message] };
        }
    }

    async deleteTodo(todoId, userId) {
        try {
            const result = await this.collection.findOneAndDelete({
                _id: new ObjectId(todoId),
                user_id: new ObjectId(userId)
            });

            if (!result) {
                return { success: false, errors: ["Todo not found"] };
            }

            return {
                success: true,
                message: "Todo deleted successfully"
            };

        } catch (error) {
            console.error("Delete todo error:", error);
            return { success: false, errors: [error.message] };
        }
    }

    async toggleTodo(todoId, userId) {
        try {
            const todo = await this.collection.findOne({
                _id: new ObjectId(todoId),
                user_id: new ObjectId(userId) 
            });

            if (!todo) {
                return { success: false, errors: ["Todo not found"] };
            }

            const result = await this.collection.findOneAndUpdate(
                { 
                    _id: new ObjectId(todoId), 
                    user_id: new ObjectId(userId) 
                },
                { 
                    $set: { 
                        completed: !todo.completed,
                        updated_at: new Date()
                    } 
                },
                { returnDocument: 'after' }
            );

            return {
                success: true,
                data: result
            };

        } catch (error) {
            console.error("Toggle todo error:", error);
            return { success: false, errors: [error.message] };
        }
    }
}

export const todoService = new TodoService();