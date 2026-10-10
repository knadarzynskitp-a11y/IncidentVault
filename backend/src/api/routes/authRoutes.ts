import express from 'express';
import * as Controllers from '../controllers/authControllers.js'

const router = express.Router();

router.post('/login', Controllers.loginController);
router.post('/register', Controllers.registerController);
router.post('/registerEnd', Controllers.registerEndController);
router.post('/forgotPassword', Controllers.forgotPasswordController);
router.post('/resetPassword', Controllers.resetPasswordController);
router.post('/logout', );
router.get('refresh', )
router.post('/nrtelAdd', );
router.post('/nrtelEnd', );

export default router;