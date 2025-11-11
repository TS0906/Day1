import express from 'express';
import { todoController } from '../controllers/todo.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authToken);

router.post('/', todoController.createTodo);

router.get('/', todoController.getTodos);

router.get('/:id', todoController.getTodoById);

router.put('/:id', todoController.updateTodo);

router.delete('/:id', todoController.deleteTodo);

router.patch('/:id/toggle', todoController.toggleTodo);

export default router;