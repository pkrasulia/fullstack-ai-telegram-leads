import React, { useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Clock, ThumbsUp } from 'lucide-react';
import { useDrag } from '@use-gesture/react';
import { animated, useSpring } from '@react-spring/web';

type Conversation = {
  id: number;
  channel: 'Telegram' | 'WhatsApp' | 'Web Chat';
  user: string;
  lastMessage: string;
  time: string;
  status: 'resolved' | 'pending' | 'new';
  aiResponse: string;
  satisfaction: 'positive' | 'neutral' | 'negative';
  messageCount: number;
};

const channelIcons = {
  Telegram: '📱',
  WhatsApp: '📞',
  'Web Chat': '💻',
};

const statusColors = {
  resolved: 'bg-green-500',
  pending: 'bg-yellow-500',
  new: 'bg-blue-500',
};

const satisfactionColors = {
  positive: 'bg-green-500',
  neutral: 'bg-gray-500',
  negative: 'bg-red-500',
};

export const RecentConversations: React.FC = () => {
  const conversations: Conversation[] = [
    {
      id: 1,
      channel: 'Telegram',
      user: 'Алексей',
      lastMessage: 'Спасибо за помощь!',
      time: '5 мин назад',
      status: 'resolved',
      aiResponse:
        'Рад помочь! Если у вас возникнут еще вопросы, не стесняйтесь обращаться.',
      satisfaction: 'positive',
      messageCount: 5,
    },
    {
      id: 2,
      channel: 'WhatsApp',
      user: 'Мария',
      lastMessage: 'Когда будет доставка?',
      time: '15 мин назад',
      status: 'pending',
      aiResponse:
        'Я проверяю информацию о вашем заказе. Подождите, пожалуйста.',
      satisfaction: 'neutral',
      messageCount: 3,
    },
    {
      id: 3,
      channel: 'Web Chat',
      user: 'Иван',
      lastMessage: 'Как мне оформить возврат?',
      time: '1 час назад',
      status: 'new',
      aiResponse: 'Для оформления возврата вам нужно...',
      satisfaction: 'neutral',
      messageCount: 1,
    },
    {
      id: 4,
      channel: 'Telegram',
      user: 'Елена',
      lastMessage: 'Отличный сервис!',
      time: '2 часа назад',
      status: 'resolved',
      aiResponse: 'Спасибо за ваш отзыв! Мы рады, что смогли помочь.',
      satisfaction: 'positive',
      messageCount: 7,
    },
    {
      id: 5,
      channel: 'WhatsApp',
      user: 'Дмитрий',
      lastMessage: 'Можно уточнить детали заказа?',
      time: '3 часа назад',
      status: 'pending',
      aiResponse: 'Конечно, я сейчас проверю информацию о вашем заказе.',
      satisfaction: 'neutral',
      messageCount: 2,
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(({ movement: [mx], down }) => {
    api.start({ x: down ? mx : 0, immediate: down });
  });

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <animated.div
        {...bind()}
        style={{ x }}
        ref={scrollRef}
        className="flex w-max space-x-4 p-4 cursor-grab active:cursor-grabbing"
      >
        {conversations.map((conv) => (
          <Card
            key={conv.id}
            className="w-[300px] shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarFallback>{conv.user[0]}</AvatarFallback>
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${conv.user}`}
                    />
                  </Avatar>
                  <div>
                    <p className="font-semibold">{conv.user}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-1">{channelIcons[conv.channel]}</span>
                      <span>{conv.channel}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${statusColors[conv.status]} text-white`}
                >
                  {conv.status}
                </Badge>
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium">Последнее сообщение:</p>
                <p className="text-sm truncate">{conv.lastMessage}</p>
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium">Ответ AI:</p>
                <p className="text-sm truncate">{conv.aiResponse}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{conv.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{conv.messageCount}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Send className="w-3 h-3" />
                  <span>AI</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp
                    className={`w-3 h-3 ${satisfactionColors[conv.satisfaction]}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </animated.div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
