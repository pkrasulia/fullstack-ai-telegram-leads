import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Mood = 'Отлично' | 'Хорошо' | 'Нейтрально' | 'Плохо' | 'Ужасно';
type Channel = 'Все каналы' | 'Telegram' | 'WhatsApp' | 'Web Chat';

interface MoodData {
  date: string;
  Отлично: number;
  Хорошо: number;
  Нейтрально: number;
  Плохо: number;
  Ужасно: number;
}

const moodColors: Record<Mood, string> = {
  Отлично: '#4CAF50',
  Хорошо: '#8BC34A',
  Нейтрально: '#FFC107',
  Плохо: '#FF9800',
  Ужасно: '#F44336',
};

const generateMockData = (days: number): MoodData[] => {
  const data: MoodData[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      Отлично: Math.floor(Math.random() * 100),
      Хорошо: Math.floor(Math.random() * 100),
      Нейтрально: Math.floor(Math.random() * 100),
      Плохо: Math.floor(Math.random() * 50),
      Ужасно: Math.floor(Math.random() * 25),
    });
  }
  return data;
};

export const ConversationOverview: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('Все каналы');
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');

  const data = generateMockData(parseInt(selectedPeriod));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce(
        (sum: number, entry: any) => sum + entry.value,
        0,
      );
      return (
        <Card className="p-2">
          <CardHeader>
            <CardTitle className="text-sm">{label}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payload.map((entry: any, index: number) => (
              <div
                key={`item-${index}`}
                className="flex justify-between items-center"
              >
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-bold ml-2">
                  {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t">
              <strong>Всего: {total}</strong>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Анализ настроения диалогов</CardTitle>
          <CardDescription>
            Показаны данные за последние {selectedPeriod} дней
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Select
            value={selectedChannel}
            onValueChange={(value: Channel) => setSelectedChannel(value)}
          >
            <SelectTrigger className="w-[160px] rounded-lg">
              <SelectValue placeholder="Выберите канал" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="Все каналы" className="rounded-lg">
                Все каналы
              </SelectItem>
              <SelectItem value="Telegram" className="rounded-lg">
                Telegram
              </SelectItem>
              <SelectItem value="WhatsApp" className="rounded-lg">
                WhatsApp
              </SelectItem>
              <SelectItem value="Web Chat" className="rounded-lg">
                Web Chat
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedPeriod}
            onValueChange={(value: '7' | '30' | '90') =>
              setSelectedPeriod(value)
            }
          >
            <SelectTrigger className="w-[160px] rounded-lg">
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7" className="rounded-lg">
                Последние 7 дней
              </SelectItem>
              <SelectItem value="30" className="rounded-lg">
                Последние 30 дней
              </SelectItem>
              <SelectItem value="90" className="rounded-lg">
                Последние 90 дней
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="aspect-auto h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('ru-RU', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(Object.keys(moodColors) as Mood[]).reverse().map((mood) => (
                <Area
                  key={mood}
                  type="monotone"
                  dataKey={mood}
                  stackId="1"
                  stroke={moodColors[mood]}
                  fill={moodColors[mood]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
