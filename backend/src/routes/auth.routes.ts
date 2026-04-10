import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { jwtAuth } from '../middlewares/jwtAuth.middleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', jwtAuth, authController.me);

export default router;