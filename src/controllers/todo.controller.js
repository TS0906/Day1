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
                const statusCode = result.errors && result.errors.includes('Permission denied') ? 403 : 400;
                res.status(statusCode).json({
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

    getMyTodos: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;

            const result = await todoService.getTodosByUserId(
                req.user._id,
                parseInt(page),
                parseInt(limit)
            );

            if (result.success) {
                res.json({ success: true, data: result.data });
            } else {
                res.status(400).json({ success: false, errors: result.errors });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    },

    getGroupTodos: async (req, res) => {
        try {
            const result = await todoService.getGroupTodos(req.params.groupId, req.user._id, req.user.role);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                const statusCode = result.errors && result.errors.includes('Permission denied') ? 403 : 400;
                res.status(statusCode).json({
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
            const result = await todoService.updateTodo(req.params.todoId, req.user._id, req.user.role, req.body);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                const statusCode = result.errors && result.errors.includes('Permission denied') ? 403 : 404;
                res.status(statusCode).json({
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
                req.body.isCompleted
            );
            if(result.success){
                res.json({
                    success: true,
                    message: "Todo status update successfully"
                });
            } else{
                const statusCode = result.errors && result.errors.includes('Permission denied') ? 403 : 404;
                res.status(statusCode).json({
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
                const statusCode = result.errors && result.errors.includes('Permission denied') ? 403 : 404;
                res.status(statusCode).json({
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
    getTodoById: async (req, res) => {
        try {
            const result = await todoService.getTodoById(req.params.todoId, req.user._id, req.user.role);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                const statusCode = result.errors && result.errors.includes('Permission denied') ? 403 : 404;
                res.status(statusCode).json({
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
    }
};