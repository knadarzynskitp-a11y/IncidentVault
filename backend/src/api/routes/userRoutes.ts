import express from 'express';
import * as Controllers from '../controllers/userControllers.js'
import { requireBeLoggedConroller } from '../controllers/authControllers.js';
const router = express.Router();

router.post('/addLawsuit', requireBeLoggedConroller, Controllers.addLawsuitController)

export default router;