# Telegram AI Assistant

A professional Telegram bot that integrates with a backend AI service to provide intelligent responses to users. Supports both regular and business messages with comprehensive session management.

## Features

- 🤖 **AI Integration**: Seamless integration with backend AI service
- 💼 **Business Messages**: Full support for Telegram Business API
- 📊 **Session Management**: Advanced session tracking and management
- 🔄 **Message History**: Automatic message storage and analysis
- ⚙️ **Configuration**: Flexible configuration via environment variables
- 🛡️ **Error Handling**: Comprehensive error handling and recovery
- 📝 **Logging**: Structured logging with multiple levels
- 🔧 **Commands**: Rich command interface for management

## Architecture

### Core Components

- **TelegramApp**: Main application orchestrator
- **TelegramService**: Handles Telegram bot interactions
- **GatewayService**: Manages communication with backend AI
- **SessionService**: Handles user session management
- **ChatService**: Manages chat sessions with backend
- **AuthService**: Handles authentication with backend
- **MessageStorageService**: Processes and stores messages

### Directory Structure

```
src/
├── app/                    # Application layer
│   ├── logs/              # Logging configuration
│   └── telegram-app.ts    # Main application class
├── config/                # Configuration management
│   └── telegram.config.ts # Configuration loader
├── services/              # Business logic services
│   ├── auth.service.ts    # Authentication service
│   ├── chat.service.ts    # Chat management service
│   ├── gateway.service.ts # Gateway service
│   ├── message-storage.service.ts # Message storage
│   ├── session.service.ts # Session management
│   └── telegram.service.ts # Telegram bot service
├── shared/                # Shared utilities and types
│   ├── base/             # Base classes
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── main.ts               # Application entry point
```

## Configuration

### Environment Variables

Create a `.env.telegram` file in the project root:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Backend API Configuration
BACKEND_BASE_URL=http://backend:4343/api/v1
BACKEND_URL=http://backend:4343

# Service Account Authentication
SERVICE_ACCOUNT_LOGIN=service@example.com
SERVICE_ACCOUNT_PASSWORD=your_password

# Session Management
SESSIONS_FILE=user_sessions.json
SESSION_CLEANUP_INTERVAL_HOURS=1
SESSION_EXPIRY_DAYS=3
SESSION_SAVE_INTERVAL_MINUTES=5

# Telegram Bot Settings
POLLING_INTERVAL_MS=300
TYPING_DELAY_MS_PER_CHAR=30
MIN_TYPING_DELAY_MS=1000
MAX_TYPING_DELAY_MS=5000
SENTENCE_DELAY_MS=800

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_MAX_SIZE=10MB
LOG_FILE_MAX_FILES=5

# Application Settings
ASSISTANT_ENABLED_BY_DEFAULT=true
FALLBACK_RESPONSES_ENABLED=true
HEALTH_CHECK_TIMEOUT_MS=5000
REQUEST_TIMEOUT_MS=20000
```

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.telegram.example .env.telegram
   # Edit .env.telegram with your configuration
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Start the Application**
   ```bash
   npm start
   ```

## Usage

### Bot Commands

- `/start` - Show help and status information
- `/status` - Display current status and statistics
- `/sessions` - Show session information
- `/on` - Enable AI assistant
- `/off` - Disable AI assistant
- `/save` - Force save all sessions
- `/clear` - Clear all sessions
- `/migrate` - Migrate session to new Chat API

### Message Types

The bot supports various message types:
- Text messages
- Photos
- Videos
- Audio/Voice messages
- Documents
- Stickers
- Locations
- Contacts
- Animations
- Video notes

### Business Messages

The bot fully supports Telegram Business API:
- Business connections
- Business messages
- Business message editing
- Business-specific metadata

## Development

### Project Structure

The project follows a clean architecture pattern:

- **App Layer**: Application orchestration and main logic
- **Service Layer**: Business logic and external integrations
- **Shared Layer**: Common utilities, types, and base classes
- **Config Layer**: Configuration management

### Key Design Patterns

- **Dependency Injection**: Services are injected where needed
- **Base Service Pattern**: Common functionality in base classes
- **Error Handling**: Comprehensive error handling with custom error types
- **Logging**: Structured logging throughout the application
- **Configuration**: Centralized configuration management

### Adding New Features

1. **Create Types**: Define TypeScript interfaces in `shared/types/`
2. **Add Utilities**: Create utility functions in `shared/utils/`
3. **Implement Service**: Create service classes extending `BaseService`
4. **Update App**: Integrate new features in `TelegramApp`
5. **Add Tests**: Write unit and integration tests

### Code Quality

- **TypeScript**: Full type safety with strict mode
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **JSDoc**: Comprehensive documentation
- **Error Handling**: Robust error handling patterns

## API Reference

### Services

#### TelegramService
Handles all Telegram bot interactions.

```typescript
class TelegramService {
  async sendMessage(chatId: number, text: string, businessConnectionId?: string): Promise<void>
  async sendMessageWithTyping(chatId: number, text: string, businessConnectionId?: string): Promise<void>
  onMessage(callback: MessageHandler): void
  onCommand(pattern: RegExp, callback: CommandHandler): void
  // ... more methods
}
```

#### GatewayService
Manages communication with backend AI service.

```typescript
class GatewayService {
  async getOrCreateUserSession(chatId: number, userName: string): Promise<UserSession | null>
  async sendMessageToGateway(session: UserSession, message: string): Promise<string | null>
  getSessionStatistics(): Record<string, any>
  // ... more methods
}
```

#### SessionService
Handles user session management.

```typescript
class SessionService {
  async getOrCreateUserSession(chatId: number, userName: string): Promise<UserSession | null>
  getUserSession(chatId: number): UserSession | undefined
  updateUserSession(chatId: number, updates: Partial<UserSession>): boolean
  // ... more methods
}
```

### Types

#### UserSession
```typescript
interface UserSession {
  userId: string;
  sessionId: string;
  userName: string;
  lastMessageTime: number;
  totalMessages: number;
  chatSessionId?: string;
}
```

#### ProcessedMessage
```typescript
interface ProcessedMessage {
  telegramMessageId: string;
  chatId: string;
  fromUserId?: string;
  fromUsername?: string;
  fromFirstName?: string;
  fromLastName?: string;
  text?: string;
  type: MessageType;
  direction: MessageDirection;
  messageDate: string;
  mediaInfo?: MediaInfo;
  replyTo?: ReplyInfo;
  forwardInfo?: ForwardInfo;
  isBusiness?: boolean;
  businessConnectionId?: string;
  rawData?: any;
  isBot?: boolean;
}
```

## Troubleshooting

### Common Issues

1. **Bot Token Invalid**
   - Check `TELEGRAM_BOT_TOKEN` in `.env.telegram`
   - Ensure token is valid and bot is not deleted

2. **Backend Connection Failed**
   - Verify `BACKEND_BASE_URL` is correct
   - Check backend service is running
   - Verify network connectivity

3. **Authentication Failed**
   - Check `SERVICE_ACCOUNT_LOGIN` and `SERVICE_ACCOUNT_PASSWORD`
   - Ensure credentials are valid
   - Check backend authentication endpoint

4. **Session Issues**
   - Check `SESSIONS_FILE` permissions
   - Verify disk space
   - Check session cleanup settings

### Logs

The application provides comprehensive logging:

- **Info**: General application flow
- **Warn**: Non-critical issues
- **Error**: Errors and exceptions
- **Debug**: Detailed debugging information

Logs are written to both console and files with rotation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the logs for error details