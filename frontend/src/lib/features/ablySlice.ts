import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AblyState {
  isConnected: boolean;
  clientId: string | null;
  channelName: string | null;
}

const initialState: AblyState = {
  isConnected: false,
  clientId: null,
  channelName: null,
};

const ablySlice = createSlice({
  name: 'ably',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setClientId: (state, action: PayloadAction<string>) => {
      state.clientId = action.payload;
    },
    setChannelName: (state, action: PayloadAction<string>) => {
      state.channelName = action.payload;
    },
    resetConnection: (state) => {
      state.isConnected = false;
      state.clientId = null;
      state.channelName = null;
    },
  },
});

export const {
  setConnectionStatus,
  setClientId,
  setChannelName,
  resetConnection,
} = ablySlice.actions;

export default ablySlice.reducer;
