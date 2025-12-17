import { ObjectId } from "mongodb";
import TodoModel from "../models/todo.js";
import GroupModel from "../models/group.js";
import { USER_ROLES } from "../constants/roles.js";

export const isTodoOwner = async (req, res, next) => {
  try {
    const { todoId } = req.params;
    const userId = req.user?._id;

    if (!ObjectId.isValid(todoId)) {
      return res.status(400).json({ success: false, error: "Invalid todoId" });
    }

    const todo = await TodoModel.findOne({ _id: todoId, isDeleted: false });
    if (!todo) {
      return res.status(404).json({ success: false, error: "Todo not found" });
    }

    const isAdmin = req.user?.role === USER_ROLES.ADMIN;
    const isOwner = todo.creatorId?.toString() === userId?.toString();

    if (isAdmin) {
      req.todo = todo;
      return next();
    }

    if (!todo.groupId) {
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: "Only creator or admin may modify",
        });
      }
      req.todo = todo;
      return next();
    }

    const group = await GroupModel.findOne({
      _id: todo.groupId,
      isDeleted: false,
    }).lean();

    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    const isGroupOwner = group.ownerId?.toString() === userId?.toString();
    if (isGroupOwner) {
      req.todo = todo;
      return next();
    }

    const permission = (group.permissions || []).find(
      (p) => p.userId?.toString() === userId?.toString()
    );

    if (!permission || !permission.canUpdateTodo) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission",
      });
    }

    req.todo = todo;
    return next();
  } catch (error) {
    console.error("Todo Permission error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};