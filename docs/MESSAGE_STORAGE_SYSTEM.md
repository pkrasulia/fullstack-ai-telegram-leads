# Telegram Message Storage System

## Overview

The Telegram bot now uses a persistent database-backed message storage system instead of local in-memory history management. All incoming and outgoing Telegram messages are automatically saved to the backend database via REST API calls.

## Architecture

### Backend Components

#### Message Entity (`backend/src/message/entities/message.entity.ts`)
- **Purpose**: TypeORM entity for storing Telegram messages
- **Key Fields**:
  - `telegramMessageId`: Original Telegram message ID
  - `chatId`: Chat identifier
  - `userId`: User identifier
  - `messageType`: Type of message (text, photo, video, etc.)
  - `direction`: incoming/outgoing
  - `text`: Message text content
  - `isBusiness`: Business connection flag
  - `rawData`: Complete original Telegram message object
  - Timestamps for creation and updates

#### Message Service (`backend/src/message/message.service.ts`)
- **Purpose**: Business logic for message operations
- **Key Methods**:
  - `create()`: Save new message
  - `findAll()`: Get all messages with filtering
  - `findByChat()`: Get messages for specific chat
  - `getStatistics()`: Message statistics
  - `getChatList()`: List of active chats

#### Message Controller (`backend/src/message/message.controller.ts`)
- **Purpose**: REST API endpoints for message management
- **Endpoints**:
  - `POST /api/v1/messages`: Create message
  - `GET /api/v1/messages`: List messages (with filters)
  - `GET /api/v1/messages/:id`: Get specific message
  - `GET /api/v1/messages/stats`: Get statistics
  - `GET /api/v1/messages/chats`: Get chat list
- **Security**: JWT authentication with role-based access

### Telegram Client Components

#### MessageStorageService (`telegram-client/src/services/message-storage-service.ts`)
- **Purpose**: Convert and send Telegram messages to backend
- **Key Methods**:
  - `saveIncomingMessage()`: Process and save incoming messages
  - `saveOutgoingMessage()`: Process and save outgoing messages
  - `checkBackendHealth()`: Verify backend connectivity
- **Features**:
  - Automatic message type detection
  - Media information extraction
  - Error handling and logging
  - Async processing to avoid blocking

#### Integration (`telegram-client/src/main.ts`)
- **Business Message Handler**: Saves all business messages
- **Regular Message Handler**: Saves all regular messages
- **Command Filtering**: Commands are not forwarded to ADK
- **Error Handling**: Graceful failure without affecting bot operation

## Configuration

### Environment Variables

```bash
# Backend URL for message storage
BACKEND_URL=http://localhost:3000

# Telegram Bot Token
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Database configuration (in backend)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=telegram_leads
```

### Backend Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Start Backend**:
   ```bash
   npm run start:dev
   ```

3. **Database**: TypeORM automatically syncs the Message entity schema

### Telegram Client Setup

1. **Install Dependencies**:
   ```bash
   cd telegram-client
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Client**:
   ```bash
   npm start
   ```

## Message Flow

1. **Incoming Message**:
   - Telegram sends message to bot
   - Bot handler receives message
   - MessageStorageService converts message format
   - HTTP POST to backend `/api/v1/messages`
   - Backend saves to database
   - Message processing continues (ADK, responses, etc.)

2. **Outgoing Message**:
   - Bot sends message via TelegramService
   - MessageStorageService captures outgoing message
   - HTTP POST to backend `/api/v1/messages`
   - Backend saves to database

## API Usage Examples

### Create Message
```bash
curl -X POST http://localhost:3000/api/v1/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "telegramMessageId": 12345,
    "chatId": -1001234567890,
    "userId": 987654321,
    "messageType": "text",
    "direction": "incoming",
    "text": "Hello, world!",
    "isBusiness": false
  }'
```

### Get Messages by Chat
```bash
curl "http://localhost:3000/api/v1/messages?chatId=-1001234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Message Statistics
```bash
curl "http://localhost:3000/api/v1/messages/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Data Types

### Message Types
- `text`: Text messages
- `photo`: Photo messages
- `video`: Video messages
- `document`: Document attachments
- `audio`: Audio messages
- `voice`: Voice messages
- `sticker`: Sticker messages
- `location`: Location sharing
- `contact`: Contact sharing
- `other`: Other message types

### Message Directions
- `incoming`: Messages received by the bot
- `outgoing`: Messages sent by the bot

## Security

- **Authentication**: JWT tokens required for all API endpoints
- **Authorization**: Role-based access (admin, service, user)
- **Data Validation**: Input validation using class-validator
- **Error Handling**: Secure error responses without sensitive data exposure

## Monitoring and Logging

### Backend Logging
- Message creation events
- API request/response logging
- Error tracking with context

### Client Logging
- Message storage success/failure
- Backend connectivity status
- Processing errors with message context

## Migration from Old System

### Removed Components
- `SimpleHistoryService`: Local message storage
- `DirectHistoryService`: Direct Telegram API history
- `AdvancedHistoryService`: Enhanced history analysis
- History-related commands: `/print_history`, `/export_leads`, etc.

### Benefits of New System
- **Persistent Storage**: Messages survive bot restarts
- **Scalability**: Database-backed storage scales better
- **Analysis**: Rich querying capabilities for message analysis
- **Reliability**: Centralized storage with backup capabilities
- **Integration**: Easy integration with other system components

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**:
   - Check `BACKEND_URL` environment variable
   - Verify backend is running on correct port
   - Check network connectivity

2. **Authentication Errors**:
   - Verify JWT token is valid
   - Check user permissions
   - Ensure proper Authorization header

3. **Message Not Saved**:
   - Check backend logs for errors
   - Verify message format is valid
   - Check database connectivity

### Debug Commands

```bash
# Test backend connectivity
curl http://localhost:3000/health

# Test message API
node test-message-storage.js

# Check backend logs
docker logs telegram-leads-backend

# Check database
psql -h localhost -U postgres -d telegram_leads -c "SELECT COUNT(*) FROM message;"
```

## Future Enhancements

- **Message Search**: Full-text search capabilities
- **Analytics Dashboard**: Web interface for message analytics
- **Export Features**: CSV/JSON export functionality
- **Real-time Updates**: WebSocket integration for live updates
- **Message Retention**: Automatic cleanup of old messages
- **Backup System**: Automated database backups
