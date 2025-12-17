import { todoService } from "../services/todo.service.js";

export const todoController = {
  createTodo: async (req, res) => {
    try {
      const result = await todoService.createTodo(req.body, req.user._id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors || [],
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  },

  createGroupTodo: async (req, res) => {
    try {
      const result = await todoService.createGroupTodo(
        req.body,
        req.params.groupId,
        req.user._id
      );

      if (!result.success) {
        return res.status(403).json({
          success: false,
          errors: result.errors || [],
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  },

  getMyTodos: async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await todoService.getTodosByUserId(
        req.user._id,
        page,
        limit
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors || [],
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  },

  getGroupTodos: async (req, res) => {
    try {
      const result = await todoService.getGroupTodos(
        req.params.groupId,
        req.user._id
      );

      if (!result.success) {
        return res.status(403).json({
          success: false,
          errors: result.errors || [],
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  },

  updateTodo: async (req, res) => {
    try {
      const result = await todoService.updateTodo(
        req.params.todoId,
        req.body,
        req.user._id,
        req.user.role
      );

      if (!result.success) {
        const errors = result.errors || [];
        const status = errors.includes("Todo not found") ? 404 : 403;
        return res.status(status).json({
          success: false,
          errors,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  },

  deleteTodo: async (req, res) => {
    try {
      const result = await todoService.deleteTodo(
        req.params.todoId,
        req.user._id,
        req.user.role
      );

      if (!result.success) {
        const errors = result.errors || [];
        const status = errors.includes("Todo not found") ? 404 : 403;
        return res.status(status).json({
          success: false,
          errors,
        });
      }

      return res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  },

  getTodoById: async (req, res) => {
    try {
      const result = await todoService.getTodoById(
        req.params.todoId,
        req.user._id,
        req.user.role
      );

      if (!result.success) {
        const errors = result.errors || [];
        const status = errors.includes("Todo not found") ? 404 : 403;
        return res.status(status).json({
          success: false,
          errors,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  },
};