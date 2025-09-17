import { fetchCredlyBadge } from '../controllers/credentialController';
import { Router } from 'express';

const router = Router();

router.get('/v1/certifications/:credentialID', fetchCredlyBadge);

export default router;
export { router as CertificationRoutes };
