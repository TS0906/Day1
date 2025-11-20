import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import {authToken} from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.js';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', authToken, authController.getMe);

router.get('/users', authToken, requireAdmin, authController.getAllUsers);
router.patch('/users/:id/role', authToken, requireAdmin, authController.updateUserRole);

export default router;