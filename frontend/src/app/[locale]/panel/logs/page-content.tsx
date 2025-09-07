'use client';
import { useState, useMemo } from 'react';
import withPageRequiredAuth from '@/services/auth/with-page-required-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  severity?: 'low' | 'medium' | 'high';
}

const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const sampleLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-07-22 10:30:15',
    action: 'Вход в систему',
    user: 'user@example.com',
    details: 'Успешный вход с IP 192.168.1.1',
    severity: 'low',
  },
  {
    id: '2',
    timestamp: '2024-07-22 11:45:22',
    action: 'Изменение настроек',
    user: 'admin@example.com',
    details: 'Обновлены настройки безопасности',
  },
  {
    id: '3',
    timestamp: '2024-07-22 12:30:00',
    action: 'Добавлена интеграция',
    user: 'dev@example.com',
    details: 'Интеграция с CRM системой',
  },
  {
    id: '4',
    timestamp: '2024-07-22 13:15:45',
    action: 'Создан чат',
    user: 'support@example.com',
    details: 'Новый чат #12345 с клиентом',
  },
  {
    id: '5',
    timestamp: '2024-07-22 14:00:10',
    action: 'Получено сообщение',
    user: 'client@example.com',
    details: 'Новое сообщение в чате #12345',
  },
  {
    id: '6',
    timestamp: '2024-07-22 14:05:30',
    action: 'Начат диалог',
    user: 'support@example.com',
    details: 'Начат диалог в чате #12345',
  },
];

function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>(sampleLogs);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [logs, searchTerm]);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    console.log('Выбран диапазон дат:', range);
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">История действий и событий</h1>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <CalendarDateRangePicker onChange={handleDateRangeChange} />
          <Button>Экспорт логов</Button>
        </div>
        <Input
          placeholder="Поиск по логам..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Журнал событий</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="mb-4 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs text-gray-500">{log.timestamp}</p>
                <h3 className="text-base font-semibold">{log.action}</h3>
                <p className="text-sm">Пользователь: {log.user}</p>
                <p className="text-sm mt-1">{log.details}</p>
                {log.severity && (
                  <Badge className={`mt-2 ${SEVERITY_COLORS[log.severity]}`}>
                    {log.severity}
                  </Badge>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default withPageRequiredAuth(LogsPage);
