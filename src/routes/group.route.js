import express from 'express';
import  {groupController}  from '../controllers/group.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';
import { authorizeRole, checkGroupPermission } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authToken);

router.post('/', groupController.createGroup);
router.get('/my-groups', groupController.getMyGroups);
router.get('/:groupId', checkGroupPermission('isMember'), groupController.getGroupById);
router.put('/:groupId', checkGroupPermission('isMember'), groupController.updateGroup);
router.delete('/:groupId', checkGroupPermission('isMember'), groupController.deleteGroup);
router.post('/:groupId/leave', checkGroupPermission('isMember'), groupController.leaveGroup);
router.post('/:groupId/permissions', checkGroupPermission('canSetPermission'), groupController.setGroupPermissions);

router.get('/admin', authorizeRole(['admin']), groupController.getAllGroups);

export default router;