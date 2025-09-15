import { ObjectId } from 'mongodb';
import { databaseService } from '../services/mongodb';

// Export MongoDB models
export { botSessionModel, BotSessionModel } from './mongo';

// Export database service for direct access if needed
export { databaseService };

// Export commonly used MongoDB types
export { ObjectId };
