import { ObjectId } from "mongodb";
import TodoModel from "../models/todo.js";
import GroupModel from "../models/group.js";
import { USER_ROLES } from "../constants/roles.js";

export const isTodoOwner = async(req, res, next) => {
    try{
        const todoId = req.params.todoId;
        const userId = req.user._id;
        if(!ObjectId.isValid(todoId)){
            return res.status(400).json({success: false, error: "Invalid ID provided: "});
        }
        const todo = await TodoModel.findOne({_id: todoId, isDeleted: false});
        if(!todo){
            return res.status(404).json({success: false, error: "Todo not found. "});
        }
        const isOwner = todo.creatorId.toString() === userId.toString();
        const isAdmin = req.user.role === USER_ROLES.ADMIN;
        if(isAdmin){
            req.todo = todo;
            return next();
        }
        if(!todo.groupId){
            if(!isOwner){
                return res.status(403).json({
                    success: false,
                    error: "Only creator or admin may modify"
                });
            }
            req.todo = todo;
            next();
        }
        const group = await GroupModel.findById(todo.groupId).lean();
        if(!group){
            return res.status(404).json({success: false, error: "Group not found"});
        }
        const isGroupOwner = group.ownerId.toString() === userId.toString();
        if(isGroupOwner){
            req.todo = todo;
            return next();
        }
        const permission = group.permissions.find(p=>
            p.userId.toString() === userId.toString()
        );
        if(!permission || !permission.canUpdateTodo){
            return res.status(403).json({
                success: false,
                error: "You do not have permission"
            });
        }
        req.todo = todo;
        next();
    } catch(error){
        console.error("Todo Permission error: ", error);
        return res.status(500).json({
            success: false, 
            error: "Internal Server Error"
        });
    }
};