import { MongoClient, Db, Collection, ObjectId, Document } from 'mongodb';
import { config } from '../config/config';
import logger from '../utils/logger';

class DatabaseService {
  private client: MongoClient;
  private db: Db | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.client = new MongoClient(config.mongoUri);
  }

  async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        this.db = this.client.db(config.mongoDbName);
        this.isConnected = true;
        logger.info(
          `Successfully connected to MongoDB database: ${config.mongoDbName}`,
        );
      }
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.close();
        this.isConnected = false;
        this.db = null;
        logger.info('Disconnected from MongoDB');
      }
    } catch (error) {
      logger.error('Failed to disconnect from MongoDB:', error);
      throw error;
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getCollection<T extends Document = Document>(
    collectionName: string,
  ): Collection<T> {
    return this.getDatabase().collection<T>(collectionName);
  }

  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  // Generic CRUD operations
  async create<T extends Document = Document>(
    collectionName: string,
    document: Omit<T, '_id'>,
  ): Promise<T> {
    try {
      const collection = this.getCollection<T>(collectionName);
      const result = await collection.insertOne(document as any);

      const insertedDocument = await collection.findOne({
        _id: result.insertedId,
      } as any);
      return insertedDocument as T;
    } catch (error) {
      logger.error(`Failed to create document in ${collectionName}:`, error);
      throw error;
    }
  }

  async findById<T extends Document = Document>(
    collectionName: string,
    id: string,
  ): Promise<T | null> {
    try {
      const collection = this.getCollection<T>(collectionName);
      const objectId = new ObjectId(id);
      const document = await collection.findOne({ _id: objectId } as any);
      return document as T | null;
    } catch (error) {
      logger.error(
        `Failed to find document by ID in ${collectionName}:`,
        error,
      );
      throw error;
    }
  }

  async findOne<T extends Document = Document>(
    collectionName: string,
    filter: any,
  ): Promise<T | null> {
    try {
      const collection = this.getCollection<T>(collectionName);
      const document = await collection.findOne(filter);
      return document as T | null;
    } catch (error) {
      logger.error(`Failed to find document in ${collectionName}:`, error);
      throw error;
    }
  }

  async findMany<T extends Document = Document>(
    collectionName: string,
    filter: any = {},
    options: {
      limit?: number;
      skip?: number;
      sort?: any;
    } = {},
  ): Promise<T[]> {
    try {
      const collection = this.getCollection<T>(collectionName);
      let query = collection.find(filter);

      if (options.sort) {
        query = query.sort(options.sort);
      }
      if (options.skip) {
        query = query.skip(options.skip);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const documents = await query.toArray();
      return documents as T[];
    } catch (error) {
      logger.error(`Failed to find documents in ${collectionName}:`, error);
      throw error;
    }
  }

  async updateById<T extends Document = Document>(
    collectionName: string,
    id: string,
    update: any,
  ): Promise<T | null> {
    try {
      const collection = this.getCollection<T>(collectionName);
      const objectId = new ObjectId(id);

      const result = await collection.updateOne({ _id: objectId } as any, {
        $set: update,
      });

      if (result.matchedCount === 0) {
        return null;
      }

      const updatedDocument = await collection.findOne({
        _id: objectId,
      } as any);
      return updatedDocument as T | null;
    } catch (error) {
      logger.error(
        `Failed to update document by ID in ${collectionName}:`,
        error,
      );
      throw error;
    }
  }

  async updateOne<T extends Document = Document>(
    collectionName: string,
    filter: any,
    update: any,
  ): Promise<T | null> {
    try {
      const collection = this.getCollection<T>(collectionName);

      const result = await collection.updateOne(filter, { $set: update });

      if (result.matchedCount === 0) {
        return null;
      }

      const updatedDocument = await collection.findOne(filter);
      return updatedDocument as T | null;
    } catch (error) {
      logger.error(`Failed to update document in ${collectionName}:`, error);
      throw error;
    }
  }

  async updateMany(
    collectionName: string,
    filter: any,
    update: any,
  ): Promise<number> {
    try {
      const collection = this.getCollection(collectionName);
      const result = await collection.updateMany(filter, { $set: update });
      return result.modifiedCount;
    } catch (error) {
      logger.error(`Failed to update documents in ${collectionName}:`, error);
      throw error;
    }
  }

  async deleteById(collectionName: string, id: string): Promise<boolean> {
    try {
      const collection = this.getCollection(collectionName);
      const objectId = new ObjectId(id);
      const result = await collection.deleteOne({ _id: objectId } as any);
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(
        `Failed to delete document by ID in ${collectionName}:`,
        error,
      );
      throw error;
    }
  }

  async deleteOne(collectionName: string, filter: any): Promise<boolean> {
    try {
      const collection = this.getCollection(collectionName);
      const result = await collection.deleteOne(filter);
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Failed to delete document in ${collectionName}:`, error);
      throw error;
    }
  }

  async deleteMany(collectionName: string, filter: any): Promise<number> {
    try {
      const collection = this.getCollection(collectionName);
      const result = await collection.deleteMany(filter);
      return result.deletedCount;
    } catch (error) {
      logger.error(`Failed to delete documents in ${collectionName}:`, error);
      throw error;
    }
  }

  async count(collectionName: string, filter: any = {}): Promise<number> {
    try {
      const collection = this.getCollection(collectionName);
      return await collection.countDocuments(filter);
    } catch (error) {
      logger.error(`Failed to count documents in ${collectionName}:`, error);
      throw error;
    }
  }

  async aggregate<T>(collectionName: string, pipeline: any[]): Promise<T[]> {
    try {
      const collection = this.getCollection(collectionName);
      const result = await collection.aggregate(pipeline).toArray();
      return result as T[];
    } catch (error) {
      logger.error(
        `Failed to aggregate documents in ${collectionName}:`,
        error,
      );
      throw error;
    }
  }
}

// Create and export a singleton instance
export const databaseService = new DatabaseService();
