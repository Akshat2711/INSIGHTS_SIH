# MongoDB Integration Documentation

This document describes the MongoDB integration that has been added to the Aryabytes Services project.

## Overview

The project now includes a complete MongoDB database layer alongside the existing Prisma/PostgreSQL setup. This provides:

- **Database Service**: A comprehensive service for MongoDB operations
- **Models**: Type-safe model classes for common operations
- **Enhanced Controllers**: Chat controller with MongoDB persistence
- **API Endpoints**: RESTful endpoints for data management

## 🚀 Quick Start

### Prerequisites

- MongoDB URI configured in `.env` file:

```env
MONGO_URI=""
```

### Testing Connection

Run the test script to verify MongoDB connectivity:

```bash
node test-mongodb.js
```

### Starting the Server

The server will automatically connect to MongoDB on startup:

```bash
npm run dev
```

## 📁 File Structure

```
src/
├── services/
│   └── database.ts          # MongoDB connection and service layer
├── models/
│   └── index.ts            # Model classes for data operations
├── types/
│   └── database.ts         # TypeScript interfaces and types
├── controllers/
│   └── chatController.ts   # Enhanced chat controller with MongoDB
└── routes/
    └── chat.ts            # Updated routes with new endpoints
```

## 🔧 Core Components

### 1. Database Service (`src/services/database.ts`)

The `DatabaseService` class provides:

- **Connection Management**: Automatic connection/disconnection
- **CRUD Operations**: Generic methods for all collections
- **Error Handling**: Comprehensive error logging
- **Type Safety**: Full TypeScript support

#### Key Methods:

```typescript
// Connection
await databaseService.connect();
await databaseService.disconnect();

// CRUD Operations
await databaseService.create(collection, document);
await databaseService.findById(collection, id);
await databaseService.findOne(collection, filter);
await databaseService.findMany(collection, filter, options);
await databaseService.updateById(collection, id, update);
await databaseService.deleteById(collection, id);

// Advanced Operations
await databaseService.aggregate(collection, pipeline);
await databaseService.count(collection, filter);
```

### 2. Data Models (`src/models/index.ts`)

Pre-built model classes for common operations:

#### UserModel

```typescript
await UserModel.create(userData);
await UserModel.findByEmail(email);
await UserModel.findByUsername(username);
await UserModel.updateLastLogin(id);
await UserModel.findActiveUsers();
```

#### ChatModel

```typescript
await ChatModel.create(chatData);
await ChatModel.findByUserId(userId, options);
await ChatModel.findBySessionId(sessionId, options);
await ChatModel.updateResponse(id, response, metadata);
await ChatModel.getRecentChats(limit);
```

#### BotModel

```typescript
await BotModel.create(botData);
await BotModel.findByOwnerId(ownerId, options);
await BotModel.findActiveBots();
await BotModel.toggleActive(id);
```

#### SessionModel

```typescript
await SessionModel.create(sessionData);
await SessionModel.findBySessionId(sessionId);
await SessionModel.endSession(sessionId);
await SessionModel.incrementMessageCount(sessionId);
await SessionModel.getActiveSessions();
```

#### LogModel

```typescript
await LogModel.create(logData);
await LogModel.findByLevel(level, options);
await LogModel.findByService(service, options);
await LogModel.deleteOldLogs(daysOld);
```

#### MQTTMessageModel

```typescript
await MQTTMessageModel.create(messageData);
await MQTTMessageModel.findByTopic(topic, options);
await MQTTMessageModel.findUnprocessed();
await MQTTMessageModel.markAsProcessed(id, error);
```

### 3. Type Definitions (`src/types/database.ts`)

Comprehensive TypeScript interfaces:

- `BaseDocument`: Base interface for all MongoDB documents
- `User`, `Chat`, `Bot`, `Session`, `Log`, `MQTTMessage`: Entity interfaces
- `ApiResponse<T>`: Standardized API response format
- `QueryOptions`: Database query options
- `Collections`: Enum for collection names

### 4. Enhanced Chat Controller

The chat controller now includes MongoDB integration:

#### Features:

- **Session Management**: Automatic session creation and tracking
- **Chat Persistence**: All conversations saved to database
- **Response Metadata**: Processing time, token count, model info
- **Error Resilience**: Continues operation even if database fails

#### Example Usage:

```typescript
// Send chat with user tracking
POST /api/v1/generate/chat/response
{
  "user_query": "Hello, how are you?",
  "userId": "user123",
  "sessionId": "session456", // optional
  "system_prompt": "You are a helpful assistant."
}

// Response includes database info
{
  "success": true,
  "data": {
    "response": "Hello! I'm doing well, thank you for asking.",
    "sessionId": "session456",
    "processingTime": 1250,
    "chatId": "68bf4a52318f9da4deeb7796"
  },
  "message": "Chat processed successfully"
}
```

## 🛣️ API Endpoints

### Chat Endpoints

| Method | Endpoint                         | Description                                     |
| ------ | -------------------------------- | ----------------------------------------------- |
| POST   | `/api/v1/generate/chat/response` | Generate chat response with MongoDB persistence |
| GET    | `/api/v1/chat/history/:userId`   | Get chat history for a user                     |
| GET    | `/api/v1/chat/sessions/:userId`  | Get user's chat sessions                        |
| DELETE | `/api/v1/chat/:chatId`           | Delete a specific chat message                  |

### Query Parameters

#### Chat History (`/api/v1/chat/history/:userId`)

- `sessionId` (optional): Filter by specific session
- `limit` (optional): Number of messages to return (default: 50)
- `skip` (optional): Number of messages to skip (default: 0)

#### User Sessions (`/api/v1/chat/sessions/:userId`)

- `limit` (optional): Number of sessions to return (default: 20)
- `skip` (optional): Number of sessions to skip (default: 0)

## 🏗️ Database Schema

### Collections

1. **users**: User accounts and profiles
2. **chats**: Chat messages and responses
3. **bots**: Bot configurations
4. **sessions**: Chat sessions
5. **logs**: Application logs
6. **mqtt_messages**: MQTT message queue

### Document Structure Examples

#### Chat Document

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  message: "Hello, how are you?",
  response: "I'm doing well, thank you!",
  sessionId: "session123",
  metadata: {
    model: "gemini-2.5-flash",
    tokens: 45,
    processingTime: 1250,
    systemPrompt: "You are a helpful assistant."
  },
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

#### Session Document

```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  sessionId: "session123",
  startTime: ISODate("..."),
  endTime: null, // null for active sessions
  messagesCount: 15,
  metadata: {},
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

## 🔒 Error Handling

The MongoDB integration includes comprehensive error handling:

1. **Connection Failures**: Server continues with existing functionality
2. **Database Errors**: Operations fail gracefully without affecting API responses
3. **Type Safety**: Full TypeScript coverage prevents runtime type errors
4. **Graceful Degradation**: Chat functionality works even if database is unavailable

## 🔄 Migration & Deployment

### Environment Setup

Ensure these environment variables are set:

```env
# MongoDB Configuration
MONGO_URI="your-mongodb-connection-string"

# Existing configuration remains unchanged
DATABASE_URL="your-postgresql-url"  # Still used for Prisma
JWT_SECRET="your-jwt-secret"
# ... other variables
```

### Server Startup

The server initialization sequence:

1. Load environment variables
2. Connect to MongoDB
3. Start Express server
4. Handle graceful shutdown with database disconnection

### Health Checks

The MongoDB connection status can be checked:

```typescript
if (databaseService.isConnectedToDatabase()) {
  console.log('MongoDB is connected');
}
```

## 🧪 Testing

### Manual Testing

1. **Connection Test**: `node test-mongodb.js`
2. **API Testing**: Use the chat endpoints with a tool like Postman
3. **Database Verification**: Check MongoDB Atlas dashboard

### Example Test Scenarios

```bash
# Test chat with user tracking
curl -X POST http://localhost:8080/api/v1/generate/chat/response \
  -H "Content-Type: application/json" \
  -d '{
    "user_query": "Hello!",
    "userId": "test123"
  }'

# Get chat history
curl http://localhost:8080/api/v1/chat/history/test123

# Get user sessions
curl http://localhost:8080/api/v1/chat/sessions/test123
```

## 📈 Performance Considerations

1. **Connection Pooling**: MongoDB driver handles connection pooling automatically
2. **Indexing**: Consider adding indexes for frequently queried fields
3. **Aggregation**: Use aggregation pipelines for complex queries
4. **Caching**: Implement caching for frequently accessed data

## 🔮 Future Enhancements

Potential areas for expansion:

1. **User Management**: Complete user authentication system
2. **Bot Management**: CRUD operations for bot configurations
3. **Analytics**: Advanced analytics and reporting
4. **Real-time Updates**: WebSocket integration for live chat
5. **Search**: Full-text search capabilities
6. **Backup**: Automated backup and restore procedures

## 🆘 Troubleshooting

### Common Issues

1. **Connection Errors**: Check MongoDB URI and network connectivity
2. **Type Errors**: Ensure all interfaces match MongoDB document structure
3. **Performance Issues**: Check query patterns and consider indexing

### Debug Mode

Enable detailed logging by setting log level to debug in development:

```typescript
logger.level = 'debug';
```

---

This MongoDB integration provides a robust, type-safe, and scalable database layer while maintaining backward compatibility with existing functionality.
