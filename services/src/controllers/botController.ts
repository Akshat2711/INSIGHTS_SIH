import { Request, Response } from 'express';
import logger from '../utils/logger';

const botController = (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile('bot.js', { root: process.cwd() + '/src/bot/' }, (err) => {
      if (err) {
        logger.error('Error sending bot file:', err);
        res.status(500).send('Failed to serve bot file');
      }
    });
    return;
  } catch (error) {
    logger.error('Error in botController:', error);
  }
};

export { botController };
