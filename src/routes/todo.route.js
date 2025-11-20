import express from 'express';
import { todoController } from '../controllers/todo.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authToken);

router.post('/', todoController.createTodo);
router.get('/', todoController.getMyTodos);
router.get('/:id', todoController.getTodoById);
router.patch('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

router.post('/groups/:groupId', todoController.createGroupTodo);
router.get('/groups/:groupId', todoController.getGroupTodos);

export default router;