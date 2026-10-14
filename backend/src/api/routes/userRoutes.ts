import express from 'express';
import * as Controllers from '../controllers/userControllers.js'
import { requireBeLoggedConroller } from '../controllers/authControllers.js';
const router = express.Router();

router.post('/lawsuits/addLawsuit', requireBeLoggedConroller, Controllers.addLawsuitController);
router.post('/lawsuits/:lawsuitId/members', requireBeLoggedConroller, Controllers.addUserToLawsuitController);

export default router;