import express from 'express';
import { todoController } from '../controllers/todo.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';
import { checkGroupPermission } from '../middlewares/role.middleware.js';
import { isTodoOwner } from '../middlewares/todo.middleware.js';

const router = express.Router();

router.use(authToken);

router.post('/', todoController.createTodo);
router.get('/', todoController.getMyTodos);
router.get('/:todoId', todoController.getTodoById);
router.patch('/:todoId', isTodoOwner, todoController.updateTodo);
router.delete('/:todoId', isTodoOwner, todoController.deleteTodo);

router.post('/groups/:groupId', checkGroupPermission('canCreateTodo'), todoController.createGroupTodo);
router.get('/groups/:groupId', checkGroupPermission('isMember'), todoController.getGroupTodos);
router.patch('/:todoId/status', checkGroupPermission('canUpdateTodo'), todoController.updateTodoStatus);

export default router;