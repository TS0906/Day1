import express from 'express';
import { invitationController } from '../controllers/invitation.controller.js';
import { authToken } from '../middlewares/auth.middleware.js';
import { checkGroupPermission } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(authToken);

router.post('/groups/:groupId/invite', checkGroupPermission('canSetPermission'), invitationController.createInvitation);
router.get('/', invitationController.getMyInvitations);
router.post('/:token/accept', invitationController.acceptInvitation);
router.post('/:token/reject', invitationController.rejectInvitation);

router.delete('/:invitationId', invitationController.cancelInvitation);

export default router;