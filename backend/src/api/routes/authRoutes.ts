import express from 'express';
import * as Controllers from '../controllers/authControllers.js'

const router = express.Router();

router.post('/login', Controllers.loginController);
router.post('/register', Controllers.registerController);
router.post('/registerEnd', Controllers.registerEndController);
router.post('/forgotPassword', );
router.post('/resetPassword', );
router.post('/logout', );
router.post('/nrtelAdd', );
router.post('/nrtelEnd', );

export default router;