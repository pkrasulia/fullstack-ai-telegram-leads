import { addMessage } from '@/lib/features/messageSlice';
import { RootState } from '@/lib/store';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

interface Message {
  token: string;
  text: string;
  type: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  dialog: {
    id: number;
    token: string;
    status: string;
    source: string | null;
    recipientName: string | null;
  };
  id: number;
  model: string;
  serviceStatus: string;
  used_tokens: number | null;
  user: {
    id: number;
    telegramId: string | null;
    firstName: string;
    lastName: string;
    createdAt: string;
  };
}

interface MessageInterceptorProps {
  message: Message | { action: string; content: { messageParams: Message } };
}

const MessageInterceptor: React.FC<MessageInterceptorProps> = ({ message }) => {
  const dispatch = useDispatch();
  const currentDialogId = useSelector(
    (state: RootState) => state.dialogs.currentDialogId,
  );

  useEffect(() => {
    if (message && typeof message === 'object') {
      if ('action' in message && message.action === 'newMessage') {
        processMessage(message.content.messageParams);
      } else if ('token' in message && 'text' in message) {
        processMessage(message as Message);
      }
    }
  }, [message, dispatch, currentDialogId]);

  const processMessage = (newMessage: Message) => {
    console.log('Обработка сообщения:', newMessage);

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? dateString : date.toLocaleString();
    };

    const localCreatedAt = formatDate(newMessage.createdAt);
    const localUpdatedAt = formatDate(newMessage.updatedAt);

    const dialogId = newMessage.dialog?.id;

    if (currentDialogId && dialogId === currentDialogId) {
      const normalizedMessage = {
        ...newMessage,
        createdAt: localCreatedAt,
        updatedAt: localUpdatedAt,
        type: newMessage.source === 'ai' ? 'outgoing' : 'incoming',
      };

      console.log(
        `>>> NEW MESSAGE ${newMessage.source === 'ai' ? 'ASSISTANT' : 'USER'}`,
      );
      console.log(normalizedMessage);

      dispatch(addMessage(normalizedMessage));

      const toastMessage =
        newMessage.source === 'ai'
          ? 'Новое сообщение от ассистента'
          : 'Новое сообщение';
      const toastDescription =
        newMessage.source === 'ai'
          ? 'Получен ответ от ассистента'
          : 'Пришло новое сообщение';

      toast(toastMessage, {
        description: toastDescription,
        action: {
          label: 'Прочитать',
          onClick: () => console.log('Прочитано'),
        },
      });
    }
  };

  return null;
};

export default MessageInterceptor;
