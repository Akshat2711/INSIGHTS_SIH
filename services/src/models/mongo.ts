import { Collection, ObjectId } from 'mongodb';
import { databaseService } from '../services/mongodb';
import { typeBotSession, Collections } from '../types/mongo';

export class BotSessionModel {
  private get collection(): Collection<typeBotSession> {
    return databaseService.getCollection<typeBotSession>(Collections.SESSIONS);
  }

  // Create a new bot session
  async create(
    sessionData: Omit<typeBotSession, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<typeBotSession> {
    const now = new Date();
    const document = {
      ...sessionData,
      createdAt: now,
      updatedAt: now,
    };

    return await databaseService.create<typeBotSession>(
      Collections.SESSIONS,
      document,
    );
  }

  // Find a bot session by ID
  async findById(id: string): Promise<typeBotSession | null> {
    return await databaseService.findById<typeBotSession>(
      Collections.SESSIONS,
      id,
    );
  }

  // Find a bot session by custom filter
  async findOne(filter: any): Promise<typeBotSession | null> {
    return await databaseService.findOne<typeBotSession>(
      Collections.SESSIONS,
      filter,
    );
  }

  // Find multiple bot sessions
  async findMany(
    filter: any = {},
    options: {
      limit?: number;
      skip?: number;
      sort?: any;
    } = {},
  ): Promise<typeBotSession[]> {
    return await databaseService.findMany<typeBotSession>(
      Collections.SESSIONS,
      filter,
      options,
    );
  }

  // Update a bot session by ID
  async updateById(
    id: string,
    updateData: Partial<Omit<typeBotSession, '_id' | 'createdAt'>>,
  ): Promise<typeBotSession | null> {
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    return await databaseService.updateById<typeBotSession>(
      Collections.SESSIONS,
      id,
      update,
    );
  }

  // Update a bot session by filter
  async updateOne(
    filter: any,
    updateData: Partial<Omit<typeBotSession, '_id' | 'createdAt'>>,
  ): Promise<typeBotSession | null> {
    const update = {
      ...updateData,
      updatedAt: new Date(),
    };

    return await databaseService.updateOne<typeBotSession>(
      Collections.SESSIONS,
      filter,
      update,
    );
  }

  // Add a message to the chat flow
  async addMessage(
    sessionId: string,
    message: { role: 'user' | 'model'; parts: { text: string }[] },
  ): Promise<typeBotSession | null> {
    const session = await this.findById(sessionId);
    if (!session) {
      return null;
    }

    const updatedChatFlow = [...session.chat_flow, message];
    return await this.updateById(sessionId, { chat_flow: updatedChatFlow });
  }

  // Delete a bot session by ID
  async deleteById(id: string): Promise<boolean> {
    return await databaseService.deleteById(Collections.SESSIONS, id);
  }

  // Delete a bot session by filter
  async deleteOne(filter: any): Promise<boolean> {
    return await databaseService.deleteOne(Collections.SESSIONS, filter);
  }

  // Delete multiple bot sessions
  async deleteMany(filter: any): Promise<number> {
    return await databaseService.deleteMany(Collections.SESSIONS, filter);
  }

  // Count bot sessions
  async count(filter: any = {}): Promise<number> {
    return await databaseService.count(Collections.SESSIONS, filter);
  }

  // Aggregate data from bot sessions
  async aggregate<T>(pipeline: any[]): Promise<T[]> {
    return await databaseService.aggregate<T>(Collections.SESSIONS, pipeline);
  }

  // Get the raw collection for advanced operations
  getRawCollection(): Collection<typeBotSession> {
    return this.collection;
  }
}

// Export a singleton instance
export const botSessionModel = new BotSessionModel();
