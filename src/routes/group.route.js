import express from 'express';
import  {groupController}  from '../controllers/group.controller.js';
import { todoController } from '../controllers/todo.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';
import { authorizeRole, checkGroupPermission } from '../middlewares/role.middleware.js';

const router = express.Router();
router.use(authToken);

router.get('/admin', authorizeRole(['admin']), groupController.getAllGroups);
router.post('/', groupController.createGroup);
router.get('/my-groups', groupController.getMyGroups);

router.get('/:groupId', checkGroupPermission('isMember'), groupController.getGroupById);
router.put('/:groupId', checkGroupPermission('canSetPermission'), groupController.updateGroup);
router.delete('/:groupId', authorizeRole(['admin']), groupController.deleteGroup);
router.post('/:groupId/leave', checkGroupPermission('isMember'), groupController.leaveGroup);
router.post('/:groupId/permissions', checkGroupPermission('canSetPermission'), groupController.setGroupPermissions);

router.get('/admin', authorizeRole(['admin']), groupController.getAllGroups);

router.get('/:groupId/todos', checkGroupPermission('isMember'), todoController.getGroupTodos);

router.post('/:groupId/todos', checkGroupPermission('canCreateTodo'), todoController.createGroupTodo);

export default router;