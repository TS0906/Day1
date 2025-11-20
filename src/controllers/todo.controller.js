import { todoService } from "../services/todo.service.js";

export const todoController = {
    createTodo: async (req, res) => {
        try {

            const result = await todoService.createTodo(req.body, req.userId);
            
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
                error: "Error"
            });
        }
    },

    createGroupTodo: async (req, res) => {
        try {
            const result = await todoService.createGroupTodo(req.body, req.params.groupId, req.userId);
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
                error: "Error"
            });
        }
    },

    getMyTodos: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;

            const result = await todoService.getTodosByUserId(
                req.userId,
                parseInt(page),
                parseInt(limit)
            );

            if (result.success) {
                res.json({ success: true, data: result.data });
            } else {
                res.status(400).json({ success: false, errors: result.errors });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: "Error" });
        }
    },

    getGroupTodos: async (req, res) => {
        try {
            const result = await todoService.getGroupTodos(req.params.groupId, req.userId, req.user.role);
            if (result.success) {
                res.json({
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
                error: "Error"
            });
        }
    },

    updateTodo: async (req, res) => {
        try {
            const result = await todoService.updateTodo(req.params.id, req.userId, req.userRole, req.body);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Error"
            });
        }
    },

    deleteTodo: async (req, res) => {
        try {
            const result = await todoService.deleteTodo(req.params.id, req.userId, req.userRole);
            if (result.success) {
                res.json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(404).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Loi"
            });
        }
    },
    getTodoById: async (req, res) => {
        try {
            const result = await todoService.getTodoById(req.params.id, req.userId, req.userRole);
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    errors: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Loi"
            });
        }
    }
};