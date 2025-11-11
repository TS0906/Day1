import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import {authToken} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/me', authToken, authController.getMe);

export default router;