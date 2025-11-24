import { ObjectId } from "mongodb";
import { GET_DB } from "../config/db";

exports.authorizeRole = (roles = []) => (req, res, next) =>{
    if(typeof roles === 'string'){
        roles = [roles];
    }

    if(!roles.includes(req.user.role)){
        return res.status(403).json({success: false, message: `Role ${req.user.role} khong duoc phep truy cap`});
    }

    next();
}

exports.checkGroupPermisson = (requirePermission) => async(req, res, next) => {
    const groupId = req.params.groupId || req.body.groupId;
    if(!groupId){
        return res.status(400).json({success: false, message: 'Khong tim thay group'});
    }

    if(!ObjectId.isValid(groupId)){
        return res.status(400).json({success: false, message: 'ID group khong hop le'});
    }

    const db = GET_DB();
    const user = req.user;

    try{
        const group = await db.collection('groups').findOne({_id: new ObjectId(groupId)});

        if(!group){
            return res.status(404).json({success: false, message: 'Nhom khong ton tai'});
        }

        const isMember = group.members.some(memberId => memberId.equals(user._id));

        if(!isMember){
            return res.status(403).json({success: false, message: 'Ban khong phai la nguoi trong group'});
        }
        // la thanh vien thi dung
        if(requirePermission === 'isMember'){
            req.group = group;
            return next();
        }
        // kiem tra owner
        if(group.ownerId.equals(user._id)){
            req.group = group;
            return next();
        }
        // kiem tra quyen
        const userPermission = group.permissions.find(p => p.userId.equals(user._id));

        if(!userPermission || userPermission[requirePermission] !== true){
            return res.status(403).json({success: false, message:`Ban khong co quyen ${requirePermission} trong nhom nay`});
        }

        req.group = group;
        next();
    } catch(error){
        console.error(error);
        return res.status(500).json({success: false, message: 'Loi server khi kiem tra quyen'});
    }
}

exports.isTodoOwner = async(req, res, next) =>{
    const todoId = req.params.todoId;
    const db = GET_DB();

    try{
        const todo = await db.collection('todos').findOne({_id: new ObjectId(todoId)});

        if(!todo){
            return res.status(404).json({success: false, message: 'Todo khong ton tai'});
        }

        if(todo.creatorId.equals(req.user._id)){
            return res.status(403).json({success: false, message: 'Ban khong co quyen'});
        }

        req.todo = todo;
        next();
    } catch(error){
        console.error(error);
        return res.status(500).json({success: false, message: 'Loi server'});
    }
}