import { botController } from '../controllers/botController';
import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

const setCrossOriginResourcePolicy = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // or 'same-site'
  next();
};

router.get('/v1/bot', setCrossOriginResourcePolicy, botController);

export default router;
