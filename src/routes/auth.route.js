import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import {authToken} from '../middlewares/auth.middleware.js';
import { authorizeRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', authToken, authController.getMe);

router.get('/users', authToken, authorizeRole(['admin']), authController.getAllUsers);
router.patch('/users/:userId/role', authToken, authorizeRole(['admin']), authController.updateUserRole);

export default router;