import express from 'express';
import * as Controllers from '../controllers/userControllers.js'
import { requireBeLoggedConroller } from '../controllers/authControllers.js';
const router = express.Router();
import { addEvidenceFileController } from '../controllers/storageController.js';
import { userLimiter } from '../middleware/rateLimiters/RateLimiters.js';

router.use(userLimiter)
router.post('/lawsuits/addLawsuit', requireBeLoggedConroller, Controllers.addLawsuitController);
router.post('/lawsuits/members/:lawsuitId', requireBeLoggedConroller, Controllers.addUserToLawsuitController);
router.post('/lawsuits/addEvidence/:lawsuitId', requireBeLoggedConroller, Controllers.addEvidenceController);
router.post('/evidences/:evidenceId/files', requireBeLoggedConroller, addEvidenceFileController);
router.get('/lawsuits/takelawsuits', requireBeLoggedConroller, Controllers.takeLawsuitsController)
router.get('/lawsuits/takelawsuit/:lawsuitId', requireBeLoggedConroller, Controllers.takeLawsuitController)
router.get('/evidences/takeEvidence/:evidenceId', requireBeLoggedConroller, Controllers.takeEvidenceController)
router.get('/evidences/:evidenceId/file/:fileId/download', requireBeLoggedConroller, Controllers.takeFileController)
router.delete('lawsuits/delete/:lawsuitId', requireBeLoggedConroller, Controllers.deleteLawsuitController)
router.delete('evidences/delete/:evidenceId', requireBeLoggedConroller, Controllers.deleteEvidenceController)

export default router;