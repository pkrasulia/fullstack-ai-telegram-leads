import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Dialog {
  id: number;
  token: string;
  status: string;
  source: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  recipientTelegram: string | null;
  lastMessageAt: string | null;
  lastMessageText: string | null;
  unreadCount: number;
  telegramChatId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface DialogState {
  dialogs: Dialog[];
  currentDialogId: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DialogState = {
  dialogs: [],
  currentDialogId: null,
  isLoading: false,
  error: null,
};

export const dialogSlice = createSlice({
  name: 'dialogs',
  initialState,
  reducers: {
    setDialogs: (state, action: PayloadAction<Dialog[]>) => {
      state.dialogs = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentDialogId: (state, action: PayloadAction<number>) => {
      console.log('Previous dialog ID:', state.currentDialogId);
      console.log('New dialog ID:', action.payload);
      if (state.currentDialogId !== action.payload) {
        state.currentDialogId = action.payload;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setDialogs, setCurrentDialogId, setLoading, setError } =
  dialogSlice.actions;

export default dialogSlice.reducer;
