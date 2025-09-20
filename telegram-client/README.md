# Telegram Client - Адаптированный для новой архитектуры

## Обзор

Telegram Client был адаптирован для работы с новой архитектурой Backend Chat API. Теперь клиент использует универсальный Chat API вместо прямого обращения к ai-gateway.

## Изменения в архитектуре

### Было (старая архитектура)
- Прямое обращение к `/ai-gateway` endpoint
- Локальное управление сессиями
- Отдельное сохранение сообщений через `/messages` endpoint

### Стало (новая архитектура)
- Использование универсального Chat API (`/chat/*`)
- Автоматическое создание сессий через Chat API
- Автоматическое сохранение сообщений при отправке

## Новые компоненты

### 1. ChatService (`src/services/chat-service.ts`)
Новый сервис для работы с Chat API:
- `createSession()` - создание сессий
- `sendMessage()` - отправка сообщений
- `getSession()` - получение сессии
- `getUserSessions()` - получение всех сессий пользователя
- `deleteSession()` - удаление сессии

### 2. Обновленный GatewayService (`src/services/gateway-service.ts`)
- Интеграция с ChatService
- Автоматическое создание сессий в backend
- Обновленный интерфейс UserSession с `chatSessionId`

### 3. Обновленный MessageStorageService (`src/services/message-storage-service.ts`)
- Упрощенная логика (сообщения сохраняются автоматически через ChatService)
- Совместимость с существующим кодом

## Логика работы

1. **Получение сообщения** от пользователя Telegram
2. **Создание/получение сессии** через `getOrCreateUserSession()`
   - Если сессии нет, создается новая через `ChatService.createSession()`
   - Сохраняется `chatSessionId` для дальнейшего использования
3. **Отправка сообщения** через `ChatService.sendMessage()`
   - Сообщение автоматически сохраняется в базе данных
   - AI обрабатывает сообщение и возвращает ответ
4. **Отправка ответа** пользователю в Telegram

## API Endpoints

Telegram Client теперь использует следующие endpoints:

```
POST /api/v1/chat/sessions              # Создание сессии
GET  /api/v1/chat/sessions/:id          # Получение сессии
POST /api/v1/chat/messages              # Отправка сообщения
GET  /api/v1/chat/sessions/:id/messages # История сообщений
```

## Конфигурация

### Переменные окружения
```bash
TELEGRAM_BOT_TOKEN=your_bot_token
BACKEND_BASE_URL=http://backend:4343/api/v1
SERVICE_ACCOUNT_LOGIN=service@example.com
SERVICE_ACCOUNT_PASSWORD=secret
```

### Структура сессии
```typescript
interface UserSession {
  userId: string;           // ID пользователя Telegram
  sessionId: string;        // Локальный ID сессии
  userName: string;         // Имя пользователя
  lastMessageTime: number;  // Время последнего сообщения
  totalMessages: number;    // Количество сообщений
  chatSessionId?: string;   // ID сессии в Chat API (новое)
}
```

## Преимущества новой архитектуры

1. **Универсальность**: API не привязан к Telegram
2. **Автоматизация**: Сообщения сохраняются автоматически
3. **Масштабируемость**: Легко добавить поддержку других мессенджеров
4. **Централизация**: Вся логика чатов в одном API
5. **Консистентность**: Единый интерфейс для всех клиентов

## Совместимость

- Все существующие команды Telegram работают как прежде
- Локальные сессии сохраняются для быстрого доступа
- Fallback логика при недоступности backend
- Обратная совместимость с существующими данными

## Запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run start:dev

# Сборка и запуск в продакшене
npm run start:prod
```

## Логирование

Все операции логируются с помощью Winston:
- Создание сессий
- Отправка сообщений
- Ошибки API
- Статистика использования

## Мониторинг

Команды для мониторинга:
- `/status` - общий статус
- `/sessions` - информация о сессии
- `/on`/`/off` - включение/выключение ассистента
