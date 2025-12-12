import TodoModel from "../models/todo.js";
import GroupModel from "../models/group.js";
import { ObjectId } from "mongodb";
import { validateTodo } from "../utils/validators.js";
import { USER_ROLES } from "../constants/roles.js";

const isGroupMember = async (groupId, userId) => {
    if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)) return false;

    const group = await GroupModel.findOne({
        _id: groupId,
        members: userId
    }).lean();

    return !!group;
};

const createTodo = async (todoData, userId) => {
    try {
        if (!ObjectId.isValid(userId)) {
            return { success: false, errors: ["Invalid user ID"] };
        }

        const validation = validateTodo(todoData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const todo = await TodoModel.create({
            title: todoData.title.trim(),
            description: todoData.description || "",
            isCompleted: false,
            creatorId: userId,
            groupId: null,
            isDeleted: false
        });

        return { success: true, data: todo.toJSON() };
    } catch (error) {
        console.error("Error creating todo:", error);
        throw error;
    }
};

const createGroupTodo = async (todoData, groupId, userId) => {
    try {
        if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)) {
            return { success: false, errors: ["Invalid ID provided"] };
        }

        const validation = validateTodo(todoData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        const allowed = await isGroupMember(groupId, userId);
        if (!allowed) {
            return { success: false, errors: ["Group not found or you are not a member"] };
        }

        const todo = await TodoModel.create({
            title: todoData.title.trim(),
            description: todoData.description || "",
            isCompleted: false,
            creatorId: userId,
            groupId,
            isDeleted: false
        });

        return { success: true, data: todo.toJSON() };
    } catch (error) {
        console.error("Error creating group todo:", error);
        throw error;
    }
};

const getTodosByUserId = async (userId, page = 1, limit = 10) => {
    try {
        if (!ObjectId.isValid(userId)) {
            return { success: false, errors: ["Invalid user ID"] };
        }

        const skip = (page - 1) * limit;

        const query = {
            creatorId: userId,
            groupId: null,
            isDeleted: false
        };

        const todos = await TodoModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await TodoModel.countDocuments(query);

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
        console.error("Error retrieving todos:", error);
        throw error;
    }
};

const getGroupTodos = async (groupId, userId) => {
    try {
        if (!ObjectId.isValid(groupId) || !ObjectId.isValid(userId)) {
            return { success: false, errors: ["Invalid ID provided"] };
        }

        const allowed = await isGroupMember(groupId, userId);
        if (!allowed) {
            return { success: false, errors: ["Group not found or access denied"] };
        }

        const todos = await TodoModel.find({
            groupId,
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .lean();

        return { success: true, data: todos };
    } catch (error) {
        console.error("Error retrieving group todos:", error);
        throw error;
    }
};

const updateTodo = async (todoId, updateData, userId, userRole) => {
    try {
        if (!ObjectId.isValid(todoId) || !ObjectId.isValid(userId)) {
            return { success: false, errors: ["Invalid ID provided"] };
        }

        // Check permission
        const todo = await TodoModel.findById(todoId).lean();
        if (!todo) return { success: false, errors: ["Todo not found"] };

        // Only creator OR admin can update
        if (
            todo.creatorId.toString() !== userId &&
            userRole !== USER_ROLES.ADMIN
        ) {
            return { success: false, errors: ["Permission denied"] };
        }

        const updateFields = {};

        if (updateData.title) updateFields.title = updateData.title.trim();
        if (updateData.description !== undefined)
            updateFields.description = updateData.description;
        if (updateData.isCompleted !== undefined)
            updateFields.isCompleted = updateData.isCompleted;

        const updated = await TodoModel.findOneAndUpdate(
            { _id: todoId },
            { $set: updateFields },
            { new: true, lean: true }
        );

        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating todo:", error);
        throw error;
    }
};

const getTodoById = async (todoId, userId, userRole) => {
    try {
        if (!ObjectId.isValid(todoId) || !ObjectId.isValid(userId)) {
            return { success: false, errors: ["Invalid ID provided"] };
        }

        const todo = await TodoModel.findOne({
            _id: todoId,
            isDeleted: false
        }).lean();

        if (!todo) {
            return { success: false, errors: ["Todo not found"] };
        }

        // Permission check
        const isCreator = todo.creatorId.toString() === userId;
        const isAdmin = userRole === USER_ROLES.ADMIN;

        const isMember =
            todo.groupId !== null
                ? await isGroupMember(todo.groupId, userId)
                : false;

        if (!isCreator && !isAdmin && !isMember) {
            return { success: false, errors: ["Permission denied"] };
        }

        return { success: true, data: todo };
    } catch (error) {
        console.error("Error retrieving todo by ID:", error);
        throw error;
    }
};

const deleteTodo = async (todoId, userId, userRole) => {
    try {
        if (!ObjectId.isValid(todoId) || !ObjectId.isValid(userId)) {
            return { success: false, errors: ["Invalid ID provided"] };
        }

        const todo = await TodoModel.findById(todoId);
        if (!todo) return { success: false, errors: ["Todo not found"] };

        const isOwner = todo.creatorId.toString() === userId;
        const isAdmin = userRole === USER_ROLES.ADMIN;

        if (!isOwner && !isAdmin) {
            return { success: false, errors: ["Permission denied"] };
        }

        const result = await TodoModel.findOneAndUpdate(
            { _id: todoId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true, lean: true }
        );

        return { success: true, message: "Todo deleted successfully" };
    } catch (error) {
        console.error("Error deleting todo:", error);
        throw error;
    }
};

export const todoService = {
    createTodo,
    createGroupTodo,
    getTodosByUserId,
    getGroupTodos,
    updateTodo,
    getTodoById,
    deleteTodo
};