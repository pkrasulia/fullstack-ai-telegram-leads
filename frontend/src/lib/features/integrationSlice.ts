import { API_URL } from '@/services/api/config';
import useFetch from '@/services/api/use-fetch';
import { Action, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  integrations: [],
  isLoading: false,
  error: null,
};

export interface IntegrationElement {
  id: number;
  login: string;
  session_name: string;
  user_id: number;
  accountParams: any;
  isAuthenticated: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    addIntegrations: (state, action) => {
      state.integrations = action.payload;
    },
    addIntegration: (state, action) => {
      //@ts-ignore
      state.integrations.push(action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { addIntegrations, addIntegration, setLoading, setError } =
  integrationsSlice.actions;
export default integrationsSlice.reducer;
