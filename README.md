# 🚀 Fullstack AI Telegram Leads

Комплексная система для сбора и обработки лидов через Telegram с использованием искусственного интеллекта.

## 📋 Описание проекта

Это fullstack приложение для автоматизации работы с лидами через Telegram, включающее:

- **Backend API** (NestJS + TypeScript) - основная бизнес-логика
- **Frontend Dashboard** (Next.js + TypeScript) - веб-интерфейс для управления
- **Telegram Bot** (TypeScript) - автоматизированный бот для работы с пользователями
- **AI Agent** (Python) - интеллектуальная обработка данных с помощью Google Gemini

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │  Telegram Bot   │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│  (TypeScript)   │
│   Port: 3000    │    │   Port: 4343    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │   AI Agent      │    │   Database      │
                    │   (Python)      │    │  (PostgreSQL)   │
                    │   Google Gemini │    │   Port: 5432    │
                    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Cache/Queue) │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 🛠️ Технологический стек

### Backend
- **NestJS** - Node.js фреймворк
- **TypeScript** - типизированный JavaScript
- **TypeORM** - ORM для работы с базой данных
- **PostgreSQL** - основная база данных
- **Redis** - кэширование и очереди
- **JWT** - аутентификация

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **Shadcn/ui** - UI компоненты
- **React Hook Form** - работа с формами

### Telegram Bot
- **TypeScript** - основной язык
- **node-telegram-bot-api** - Telegram Bot API

### AI Agent
- **Python 3.11** - основной язык
- **Google Gemini API** - искусственный интеллект
- **Vertex AI** - машинное обучение

### DevOps
- **Docker & Docker Compose** - контейнеризация
- **Nginx** - reverse proxy (production)
- **Makefile** - автоматизация команд

## 🚀 Быстрый старт

### Предварительные требования

- **Docker** и **Docker Compose**
- **Make** (опционально, для удобства)
- **Node.js 20+** (для локальной разработки)
- **Python 3.11+** (для AI агента)

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd fullstack-ai-telegram-leads
```

### 2. Настройка переменных окружения

Скопируйте примеры конфигураций и настройте их:

```bash
# Основные переменные
cp .env-example/.env.shared .env.shared
cp .env-example/.env.backend .env.backend
cp .env-example/.env.frontend .env.frontend
cp .env-example/.env.agent .env.agent
cp .env-example/.env.telegram .env.telegram
```

### 3. Настройка ключевых переменных

#### `.env.shared` - общие настройки
```env
# Database
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=telegram_leads

# Redis
REDIS_PASSWORD=your_redis_password
```

#### `.env.backend` - настройки бэкенда
```env
APP_PORT=4343
AUTH_JWT_SECRET=your_jwt_secret
FRONTEND_DOMAIN=http://localhost:3000
```

#### `.env.agent` - настройки AI агента
```env
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CLOUD_PROJECT=your_project_id
```

#### `.env.telegram` - настройки Telegram бота
```env
TELEGRAM_BOT_TOKEN=your_bot_token
```

### 4. Запуск проекта

#### Вариант A: Полный запуск через Make (рекомендуется)

```bash
# Показать все доступные команды
make help

# Запуск только инфраструктуры (БД, Redis, Mail)
make infra-up

# Запуск всех сервисов в development режиме
make up

# Запуск с пересборкой образов
make up-b
```

#### Вариант B: Прямые Docker Compose команды

```bash
# Только инфраструктура
docker compose -f docker-compose.infrastructure.yml up -d

# Все сервисы
docker compose -f docker-compose.dev.yml up -d

# С пересборкой
docker compose -f docker-compose.dev.yml up -d --build
```

### 5. Проверка запуска

После запуска будут доступны:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4343
- **API Documentation**: http://localhost:4343/docs
- **Adminer (DB)**: http://localhost:8080
- **Redis Commander**: http://localhost:8081
- **MailDev**: http://localhost:1080

## 📁 Структура проекта

```
fullstack-ai-telegram-leads/
├── backend/                 # NestJS API сервер
│   ├── src/
│   │   ├── auth/           # Аутентификация
│   │   ├── database/       # Конфигурация БД
│   │   ├── leads/          # Управление лидами
│   │   └── users/          # Управление пользователями
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js веб-приложение
│   ├── src/
│   │   ├── app/           # App Router (Next.js 14)
│   │   ├── components/    # React компоненты
│   │   └── lib/          # Утилиты и конфигурация
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── package.json
├── telegram-client/        # Telegram бот
│   ├── src/
│   │   ├── app/          # Основная логика бота
│   │   ├── services/     # Сервисы
│   │   └── shared/       # Общие утилиты
│   ├── Dockerfile
│   └── package.json
├── agent/                  # Python AI агент
│   ├── assistant/        # AI логика
│   ├── entities/         # Модели данных
│   ├── shared_libraries/ # Общие библиотеки
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.dev.yml      # Development конфигурация
├── docker-compose.prod.yml     # Production конфигурация
├── docker-compose.infrastructure.yml # Только инфраструктура
├── Makefile                    # Команды автоматизации
└── README.md
```

## 🔧 Команды разработки

### Make команды (рекомендуется)

```bash
# Разработка
make help           # Показать все команды
make infra-up       # Запуск инфраструктуры
make up             # Запуск всех сервисов
make up-b           # Запуск с пересборкой
make down           # Остановка всех сервисов
make restart        # Перезапуск
make logs           # Логи всех сервисов
make logs s=backend # Логи конкретного сервиса

# Production
make prod-build     # Сборка production образов
make prod-up        # Запуск в production режиме
make prod-down      # Остановка production
make prod-logs      # Логи production

# Утилиты
make ps             # Статус контейнеров
make app-sh         # Shell в backend контейнер
make app-sh s=frontend # Shell в frontend контейнер
make db-sh          # Shell в PostgreSQL
make psql           # Подключение к PostgreSQL
make cfg            # Показать конфигурацию
make clean          # Очистка (без volumes)
make prune          # Полная очистка (с volumes)
```

### Прямые Docker команды

```bash
# Сборка конкретного сервиса
docker compose -f docker-compose.dev.yml build backend

# Логи конкретного сервиса
docker compose -f docker-compose.dev.yml logs -f backend

# Shell в контейнер
docker compose -f docker-compose.dev.yml exec backend sh

# Перезапуск сервиса
docker compose -f docker-compose.dev.yml restart backend
```

## 🗃️ База данных

### Миграции

```bash
# Генерация миграции
docker compose -f docker-compose.dev.yml exec backend npm run migration:generate -- src/database/migrations/MigrationName

# Запуск миграций
docker compose -f docker-compose.dev.yml exec backend npm run migration:run

# Откат миграции
docker compose -f docker-compose.dev.yml exec backend npm run migration:revert
```

### Подключение к БД

```bash
# Через make
make psql

# Прямое подключение
docker compose -f docker-compose.infrastructure.yml exec postgres psql -U root -d api
```

## 🤖 Telegram Bot

### Настройка бота

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен и добавьте в `.env.telegram`:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token
   ```
3. Настройте webhook или polling в коде бота

### Команды бота

- `/start` - Начало работы с ботом
- `/help` - Помощь по командам
- `/leads` - Просмотр лидов

## 🧠 AI Agent

### Настройка Google Gemini

1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Включите Vertex AI API
3. Создайте API ключ или настройте Service Account
4. Добавьте настройки в `.env.agent`:
   ```env
   GOOGLE_API_KEY=your_api_key
   GOOGLE_CLOUD_PROJECT=your_project_id
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

## 🔐 Аутентификация

Система использует JWT токены для аутентификации:

- **Access Token** - срок жизни 15 минут
- **Refresh Token** - срок жизни 3650 дней
- Поддержка Google OAuth и Facebook OAuth

## 📊 Мониторинг

### Логи

```bash
# Все сервисы
make logs

# Конкретный сервис
make logs s=backend
make logs s=frontend
make logs s=telegram-client
make logs s=agent
```

### Health Checks

Все сервисы имеют health checks:
- **Backend**: `GET /health`
- **Frontend**: `GET /`
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

## 🚀 Production развертывание

### 1. Подготовка

```bash
# Сборка production образов
make prod-build
```

### 2. Настройка переменных

Обновите production переменные в `.env.*` файлах:
- Смените все пароли и секреты
- Настройте домены и SSL
- Настройте внешние сервисы

### 3. Запуск

```bash
# Production запуск
make prod-up

# Проверка статуса
docker compose -f docker-compose.prod.yml ps
```

### 4. Nginx (опционально)

Production конфигурация включает Nginx для:
- Reverse proxy
- SSL termination
- Static file serving
- Load balancing

## 🔧 Разработка

### Локальная разработка

Для разработки отдельных компонентов:

```bash
# Backend
cd backend
npm install
npm run start:dev

# Frontend
cd frontend
npm install
npm run start:dev

# Telegram Client
cd telegram-client
npm install
npm run start:dev

# AI Agent
cd agent
pip install -r requirements.txt
python main.py
```

### Добавление новых функций

1. **Backend**: Используйте NestJS CLI для генерации модулей
2. **Frontend**: Следуйте структуре App Router Next.js 14
3. **Database**: Создавайте миграции через TypeORM
4. **AI**: Расширяйте функциональность в Python агенте

## 🐛 Отладка

### Частые проблемы

1. **Ошибка сборки Docker**:
   ```bash
   # Очистка и пересборка
   make clean
   make up-b
   ```

2. **Проблемы с БД**:
   ```bash
   # Проверка подключения
   make psql
   
   # Перезапуск БД
   docker compose -f docker-compose.infrastructure.yml restart postgres
   ```

3. **Проблемы с переменными окружения**:
   ```bash
   # Проверка конфигурации
   make cfg
   ```

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Сделайте commit изменений
4. Создайте Pull Request

## 📞 Поддержка

Для вопросов и поддержки:
- Создайте Issue в репозитории
- Проверьте документацию API: http://localhost:4343/docs

---

**Создано с ❤️ для автоматизации работы с лидами через Telegram**