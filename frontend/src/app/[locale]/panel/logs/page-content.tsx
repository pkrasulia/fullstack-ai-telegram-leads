'use client';
import { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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

const getSampleLogs = (t: any): LogEntry[] => [
  {
    id: '1',
    timestamp: '2024-07-22 10:30:15',
    action: t('sampleLogs.login.action'),
    user: 'user@example.com',
    details: t('sampleLogs.login.details'),
    severity: 'low',
  },
  {
    id: '2',
    timestamp: '2024-07-22 11:45:22',
    action: t('sampleLogs.settingsChange.action'),
    user: 'admin@example.com',
    details: t('sampleLogs.settingsChange.details'),
  },
  {
    id: '3',
    timestamp: '2024-07-22 12:30:00',
    action: t('sampleLogs.integrationAdded.action'),
    user: 'dev@example.com',
    details: t('sampleLogs.integrationAdded.details'),
  },
  {
    id: '4',
    timestamp: '2024-07-22 13:15:45',
    action: t('sampleLogs.chatCreated.action'),
    user: 'support@example.com',
    details: t('sampleLogs.chatCreated.details'),
  },
  {
    id: '5',
    timestamp: '2024-07-22 14:00:10',
    action: t('sampleLogs.messageReceived.action'),
    user: 'client@example.com',
    details: t('sampleLogs.messageReceived.details'),
  },
  {
    id: '6',
    timestamp: '2024-07-22 14:05:30',
    action: t('sampleLogs.dialogStarted.action'),
    user: 'support@example.com',
    details: t('sampleLogs.dialogStarted.details'),
  },
];

function LogsPage() {
  const t = useTranslations('logs');
  const locale = useLocale();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize and update logs when locale changes
  useEffect(() => {
    setLogs(getSampleLogs(t));
  }, [locale, t]);

  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [logs, searchTerm]);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    console.log(t('dateRangeSelected'), range);
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <CalendarDateRangePicker onChange={handleDateRangeChange} />
          <Button>{t('exportLogs')}</Button>
        </div>
        <Input
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('eventLog')}</CardTitle>
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
                <p className="text-sm">{t('user')}: {log.user}</p>
                <p className="text-sm mt-1">{log.details}</p>
                {log.severity && (
                  <Badge className={`mt-2 ${SEVERITY_COLORS[log.severity]}`}>
                    {t(`severity.${log.severity}`)}
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
