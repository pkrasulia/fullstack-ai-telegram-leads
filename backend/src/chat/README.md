# Chat API - Универсальная система чатов

## Обзор

Новый Chat API предоставляет универсальный интерфейс для работы с чат-сессиями и сообщениями, абстрагированный от конкретных мессенджеров (Telegram, WhatsApp и т.д.).

## Архитектура

### Компоненты

1. **ChatController** - Единая точка входа для внешнего API
2. **ChatService** - Бизнес-логика работы с чатами
3. **AiSessionService** - Управление AI сессиями (внутренний)
4. **MessageService** - Управление сообщениями (внутренний)
5. **AiGatewayService** - Интеграция с AI (внутренний)

### Принципы

- **Единый API**: Один контроллер для всех операций с чатами
- **Абстракция**: API не привязан к конкретному мессенджеру
- **Внутренние сервисы**: ai-gateway, message, ai-session работают как внутренние сервисы
- **Сессии**: Каждое сообщение привязано к сессии

## API Endpoints

### Сессии

#### `POST /api/v1/chat/sessions`
Создать новую сессию чата

**Request:**
```json
{
  "title": "Название сессии",
  "userId": "user123",
  "metadata": {
    "source": "telegram",
    "chatId": "123456789"
  }
}
```

**Response:**
```json
{
  "id": "session-uuid",
  "title": "Название сессии",
  "userId": "user123",
  "adkSessionId": "adk-session-id",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### `GET /api/v1/chat/sessions/:sessionId`
Получить сессию по ID

#### `GET /api/v1/chat/sessions?userId=user123`
Получить все сессии пользователя

#### `DELETE /api/v1/chat/sessions/:sessionId`
Удалить сессию

### Сообщения

#### `POST /api/v1/chat/messages`
Отправить сообщение в сессию

**Request:**
```json
{
  "sessionId": "session-uuid",
  "text": "Привет, как дела?",
  "type": "text",
  "direction": "incoming",
  "isBot": false,
  "metadata": {
    "messageId": "msg123",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Response:**
```json
{
  "message": {
    "id": "message-uuid",
    "text": "Привет, как дела?",
    "type": "text",
    "direction": "incoming",
    "messageDate": "2024-01-01T00:00:00Z",
    "isBot": false,
    "session": {
      "id": "session-uuid",
      "title": "Название сессии"
    }
  },
  "aiResponse": {
    "message": {
      "id": "ai-message-uuid",
      "text": "Привет! У меня все хорошо, спасибо!",
      "type": "text",
      "direction": "outgoing",
      "isBot": true
    },
    "aiResult": {
      "success": true,
      "response": "Привет! У меня все хорошо, спасибо!"
    }
  }
}
```

#### `GET /api/v1/chat/sessions/:sessionId/messages`
Получить историю сообщений сессии

**Query Parameters:**
- `limit` - количество сообщений (по умолчанию 50)
- `offset` - смещение (по умолчанию 0)

## Логика работы

1. **Создание сессии**: Клиент создает сессию через `POST /api/v1/chat/sessions`
2. **Отправка сообщения**: Клиент отправляет сообщение через `POST /api/v1/chat/messages`
3. **AI обработка**: Система автоматически отправляет запрос в AI Gateway
4. **Ответ AI**: Система создает ответное сообщение от AI
5. **История**: Клиент может получить историю через `GET /api/v1/chat/sessions/:sessionId/messages`

## Интеграция с Telegram

Telegram клиент должен:

1. Создать сессию при первом сообщении пользователя
2. Отправлять каждое сообщение пользователя через Chat API
3. Получать ответы AI и отправлять их пользователю
4. Управлять сессиями (создание, удаление)

## Преимущества новой архитектуры

1. **Универсальность**: API не привязан к Telegram
2. **Простота**: Один endpoint для всех операций с чатами
3. **Масштабируемость**: Легко добавить поддержку других мессенджеров
4. **Чистота**: Внутренние сервисы не выставляются наружу
5. **Гибкость**: Легко добавлять новую функциональность
