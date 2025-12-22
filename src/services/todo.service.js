import TodoModel from "../models/todo.js";
import GroupModel from "../models/group.js";
import { ObjectId } from "mongodb";
import { USER_ROLES } from "../constants/roles.js";

const isGroupMember = async (groupId, userId) => {
  if (!ObjectId.isValid(groupId)) return false;
  const group = await GroupModel.findOne({
    _id: groupId,
    members: userId,
    isDeleted: false,
  }).lean();
  return !!group;
};

const normalizeContent = (payload) => {
  const raw = payload?.content ?? payload?.title ?? "";
  return String(raw).trim();
};

const createTodo = async (payload, userId) => {
  const content = normalizeContent(payload);
  if (!content) return { success: false, errors: ["Content is required"] };

  const todo = await TodoModel.create({
    content,
    creatorId: userId,
    completed: false,
    status: 'pending',
    groupId: null,
    isDeleted: false,
  });
  return { success: true, data: todo.toJSON() };
};

const createGroupTodo = async (todoData, userId, groupId) => {
    try {
      const content = normalizeContent(todoData);
      if(!content) return {success: false, errors: ["Content is required"]};
      const todo = await TodoModel.create({
        content,
        description: todoData.description || "",
        creatorId: userId,
        groupId: groupId, 
        status: 'pending',
        isDeleted: false,
      });
      return { success: true, data: todo };
    } catch (error) {
        throw error;
    }
};

const getTodosByUserId = async (userId, page = 1, limit = 10) => {
  if (!ObjectId.isValid(userId)) {
    return { success: false, errors: ["Invalid user ID"] };
  }
  const skip = (page - 1) * limit;
  const query = {
    creatorId: userId,
    groupId: null,
    isDeleted: false,
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
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getTodosByGroup = async (groupId) => {
    try {
        const todos = await TodoModel.find({ groupId, isDeleted: false })
            .sort({ createdAt: -1 })
            .lean();
        return { success: true, data: todos };
    } catch (error) {
        throw error;
    }
};

const updateTodo = async (todoId, payload, userId, userRole) => {
  if (!ObjectId.isValid(todoId)) {
    return { success: false, errors: ["Invalid todo id"] };
  }
  const todo = await TodoModel.findOne({
    _id: todoId,
    isDeleted: false,
  });
  if (!todo) {
    return { success: false, errors: ["Todo not found"] };
  }
  const isOwner = todo.creatorId.toString() === userId.toString();
  const isAdmin = userRole === USER_ROLES.ADMIN;
  if (!isOwner && !isAdmin) {
    return { success: false, errors: ["Permission denied"] };
  }
  const updateFields = {};
  if (payload.content !== undefined) {
    const content = String(payload.content).trim();
    if (!content) {
      return { success: false, errors: ["Content is required"] };
    }
    updateFields.content = content;
  }
  if (payload.completed !== undefined) {
    updateFields.status = payload.completed ? "completed" : "pending";
    updateFields.completed = payload.completed;
  } else if (payload.status !== undefined){
    updateFields.status = payload.status;
    updateFields.completed = payload.status === "completed";
  }
  if (Object.keys(updateFields).length === 0) {
    return { success: false, errors: ["Nothing to update"] };
  }
  const updated = await TodoModel.findByIdAndUpdate(
    todoId,
    { $set: updateFields },
    { new: true }
  );
  return { success: true, data: updated };
};
const getTodoById = async (todoId, userId, userRole) => {
  if (!ObjectId.isValid(todoId)) {
    return { success: false, errors: ["Invalid ID provided"] };
  }

  const todo = await TodoModel.findOne({ _id: todoId, isDeleted: false }).lean();
  if (!todo) return { success: false, errors: ["Todo not found"] };

  const isOwner = todo.creatorId.toString() === userId.toString();
  const isAdmin = userRole === USER_ROLES.ADMIN;

  if (isOwner || isAdmin) return { success: true, data: todo };

  if (todo.groupId) {
    const allowed = await isGroupMember(todo.groupId, userId);
    if (allowed) return { success: true, data: todo };
  }

  return { success: false, errors: ["Permission denied"] };
};

const deleteTodo = async (todoId, userId, userRole) => {
  if (!ObjectId.isValid(todoId)) {
    return { success: false, errors: ["Invalid ID provided"] };
  }

  const todo = await TodoModel.findOne({ _id: todoId, isDeleted: false });
  if (!todo) return { success: false, errors: ["Todo not found"] };

  const isOwner = todo.creatorId.toString() === userId.toString();
  const isAdmin = userRole === USER_ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    return { success: false, errors: ["Permission denied"] };
  }

  await TodoModel.updateOne({ _id: todoId }, { $set: { isDeleted: true } });
  return { success: true, message: "Todo deleted successfully" };
};

export const todoService = {
  createTodo,
  createGroupTodo,
  getTodosByUserId,
  createGroupTodo,
  getTodosByGroup,
  updateTodo,
  getTodoById,
  deleteTodo, 
};