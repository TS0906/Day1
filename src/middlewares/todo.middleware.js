import { ObjectId } from "mongodb";
import TodoModel from "../models/todo.js";
import { USER_ROLES } from "../constants/roles.js";

export const isTodoOwner = async(req, res, next) => {
    try{
        const todoId = req.params.todoId;
        const userId = req.user._id;
        if(!todoId || !ObjectId.isValid(todoId) || !ObjectId.isValid(userId)){
            return res.status(400).json({success: false, error: "Invalid ID provided: "});
        }
        const todo = await TodoModel.findOne({_id: todoId, isDeleted: false});
        if(!todo){
            return res.status(404).json({success: false, error: "Todo not found. "});
        }
        const isOwner = todo.creatorId.toString() === userId.toString();
        const isAdmin = req.user.role === USER_ROLES.ADMIN;
        if(!isOwner && !isAdmin){
            return res.status(403).json({
                success: false,
                error: "Permission denied: Only the creator or an Admin can perform this action. "
            });
        }
        req.todo = todo;
        next();
    } catch(error){
        console.error("isTodoOwner Middleware error: ", error);
        return res.status(500).json({
            success: false, 
            error: "Internal Server Error"
        });
    }
};