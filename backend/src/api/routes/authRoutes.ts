import express from 'express';
import * as Controllers from '../controllers/authControllers.js'
import { authLimiter } from '../middleware/rateLimiters/authRateLimiter.js';
const router = express.Router();

router.post('/login', authLimiter, Controllers.loginController);
router.post('/register', authLimiter, Controllers.registerController);
router.post('/registerEnd', authLimiter, Controllers.registerEndController);
router.post('/forgotPassword', authLimiter, Controllers.forgotPasswordController);
router.post('/resetPassword', authLimiter, Controllers.resetPasswordController);
router.post('/logout', authLimiter, Controllers.logoutController);
router.get('/refresh', Controllers.refreshController)


export default router;