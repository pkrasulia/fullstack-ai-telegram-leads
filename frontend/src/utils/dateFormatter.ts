export function normalizeDate(dateString: string): string {
  const date = new Date(dateString);

  // Проверяем, является ли дата валидной
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString);
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
  }

  // Если дата уже в локальном времени, просто форматируем ее
  if (dateString.includes('+')) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  // Преобразуем UTC в локальное время
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - userTimezoneOffset);
  return localDate.toISOString().slice(0, 19).replace('T', ' ');
}
