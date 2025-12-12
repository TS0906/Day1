import { todoService } from "../services/todo.service.js";

export const todoController = {
    createTodo: async (req, res) => {
        try {
            const result = await todoService.createTodo(req.body, req.user._id);
            if (result.success) {
                res.status(201).json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    createGroupTodo: async (req, res) => {
        try {
            const result = await todoService.createGroupTodo(req.body, req.params.groupId, req.user._id);
            if (result.success) {
                res.status(201).json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(403).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            console.error("createGroupTodo error", error)
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    getMyTodos: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const result = await todoService.getTodosByUserId(req.user._id, page, limit);
            return res.json({ success: true, data: result.data });
        } catch (error) {
            console.error("getMyTodos error", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },
    getGroupTodos: async (req, res) => {
        try {
            const result = await todoService.getGroupTodos(req.params.groupId, req.user._id);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(403).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    updateTodo: async (req, res) => {
        try {
            const result = await todoService.updateTodo(req.params.todoId, req.body, req.user._id, req.user.role);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(403).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    updateTodoStatus: async(req, res) =>{
        try{
            const result = await todoService.updateTodoStatus(
                req.params.todoId,
                req.body.isCompleted,
                req.user._id,
                req.user.role
            );
            if(result.success){
                res.json({
                    success: true,
                    message: "Todo status update successfully"
                });
            } else{
                res.status(403).json({
                    success: false,
                    errors: result.errors
                });
            }
        }catch(error){
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            })
        }
    },
    deleteTodo: async (req, res) => {
        try {
            const result = await todoService.deleteTodo(req.params.todoId, req.user._id, req.user.role);
            if (result.success) {
                res.json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(403).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            console.error("deleteTodo error", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    },
    getTodoById: async (req, res) => {
        try {
            const result = await todoService.getTodoById(req.params.todoId, req.user._id, req.user.role);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(403).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            console.error("getTodoById error:", error);
            res.status(500).json({
                success: false,
                error: "Internal Server Error"
            });
        }
    }
};