import { normalizeDate } from '@/utils/dateFormatter';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { current } from '@reduxjs/toolkit';

export interface Message {
  id: number;
  dialogId: number;
  text: string;
  type: 'incoming' | 'outgoing';
  source: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  status: string;
  serviceStatus: string;
  model?: string;
  used_tokens?: number | null;
}

interface MessageState {
  messages: Message[];
  currentDialogId: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  messages: [],
  currentDialogId: null,
  isLoading: false,
  error: null,
};

function normalizeMessage(message: any): Message {
  const now = new Date();
  const localISOString = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  console.log(localISOString);

  return {
    id: message.id,
    dialogId: message.dialogId || message.dialog?.id || message.id,
    text: message.text || message.content,
    type: message.type || (message.source === 'ai' ? 'outgoing' : 'incoming'),
    source: message.source || message.sender || 'user',
    token: message.token || `token-${Date.now()}`,
    createdAt: message.createdAt
      ? normalizeDate(message.createdAt)
      : localISOString,
    updatedAt: message.updatedAt
      ? normalizeDate(message.updatedAt)
      : localISOString,
    deletedAt: message.deletedAt ? normalizeDate(message.deletedAt) : null,
    status: message.status || 'sent',
    serviceStatus: message.serviceStatus || 'processed',
    model: message.model,
    used_tokens: message.used_tokens,
  };
}

export const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      console.log('Setting messages:', action.payload);
      state.messages = action.payload
        .map(normalizeMessage)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      console.log('Sorted messages:', state.messages);
    },
    addMessage: (state, action: PayloadAction<any>) => {
      console.log('Adding message:', action.payload);
      const normalizedMessage = normalizeMessage(action.payload);
      console.log('Normalized message to add:', normalizedMessage);

      state.messages.push(normalizedMessage);

      console.log('Updated messages after add:', current(state.messages));
    },
    setCurrentDialogId: (state, action: PayloadAction<number>) => {
      state.currentDialogId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{ id: number; status: Message['status'] }>,
    ) => {
      const message = state.messages.find((m) => m.id === action.payload.id);
      if (message) {
        message.status = action.payload.status;
        message.updatedAt = normalizeDate(new Date().toISOString());
        console.log('Updated message status:', message);
      }
    },
  },
});

export const {
  setMessages,
  addMessage,
  setCurrentDialogId,
  setLoading,
  setError,
  updateMessageStatus,
} = messageSlice.actions;

export default messageSlice.reducer;
