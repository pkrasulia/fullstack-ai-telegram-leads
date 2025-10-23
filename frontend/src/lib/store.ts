import { configureStore } from '@reduxjs/toolkit';
import bookSlice from './features/bookSlice';
import assistantSlice from './features/assistantSlice';
import telegramAccountSlice from './features/telegramAccountSlice';
import integrationSlice from './features/integrationSlice';

export const bookStore = () => {
  return configureStore({
    reducer: {
      booking: bookSlice,
      assistants: assistantSlice,
      telegramAccount: telegramAccountSlice,
      integrations: integrationSlice,
    },
  });
};

export type AppStore = ReturnType<typeof bookStore>;

export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
