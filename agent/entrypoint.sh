#!/bin/bash
set -e

# Ждем, пока PostgreSQL станет доступен
echo "Ожидание готовности PostgreSQL..."
until PGPASSWORD="${DATABASE_PASSWORD}" psql -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -U "${DATABASE_USERNAME}" -d "postgres" -c '\q' 2>/dev/null; do
  echo "PostgreSQL недоступен - ожидание..."
  sleep 2
done
echo "PostgreSQL готов!"

# Создаем базу данных adk_sessions, если её нет
echo "Создание базы данных ${ADK_DATABASE_NAME}..."
if ! PGPASSWORD="${DATABASE_PASSWORD}" psql -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -U "${DATABASE_USERNAME}" -d "postgres" \
  -tc "SELECT 1 FROM pg_database WHERE datname = '${ADK_DATABASE_NAME}'" | grep -q 1; then
  PGPASSWORD="${DATABASE_PASSWORD}" psql -h "${DATABASE_HOST}" -p "${DATABASE_PORT}" -U "${DATABASE_USERNAME}" -d "postgres" \
    -c "CREATE DATABASE ${ADK_DATABASE_NAME}"
  echo "База данных ${ADK_DATABASE_NAME} создана."
else
  echo "База данных ${ADK_DATABASE_NAME} уже существует."
fi

# Формируем URI для подключения к сессиям
SESSION_URI="postgresql://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${ADK_DATABASE_NAME}"

# Запускаем ADK API сервер
exec adk api_server \
    --host 0.0.0.0 \
    --port 8000 \
    --session_service_uri "$SESSION_URI"