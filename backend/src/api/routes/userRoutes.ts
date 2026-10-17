import express from 'express';
import * as Controllers from '../controllers/userControllers.js'
import { requireBeLoggedConroller } from '../controllers/authControllers.js';
const router = express.Router();
import { addEvidenceFileController } from '../controllers/storageController.js';

router.post('/lawsuits/addLawsuit', requireBeLoggedConroller, Controllers.addLawsuitController);
router.post('/lawsuits/members/:lawsuitId', requireBeLoggedConroller, Controllers.addUserToLawsuitController);
router.post('/lawsuits/addEvidence/:lawsuitId', requireBeLoggedConroller, Controllers.addEvidenceController);
router.post('/evidences/:evidenceId/files', requireBeLoggedConroller, addEvidenceFileController);
router.get('/lawsuits/takelawsuits', requireBeLoggedConroller, Controllers.takeLawsuitsController)

export default router;