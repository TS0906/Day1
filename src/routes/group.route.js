import express from 'express';
import  {groupController}  from '../controllers/group.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.js';

const router = express.Router();

router.use(authToken);

router.post('/', groupController.createGroup);
router.get('/my-groups', groupController.getMyGroups);
router.get('/:id', groupController.getGroupById);
router.put('/:id', groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);
router.post('/:id/leave', groupController.leaveGroup);
router.post('/groups/:groupId/permissions', groupController.setGroupPermissions);

router.get('/admin', requireAdmin, groupController.getAllGroups);

export default router;