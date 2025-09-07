import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Assistant {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  availability?: string;
  createdAt?: string;
  model?: string;
  responseTime?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  dialogsCount?: number;
  messagesCount?: number;
}

interface CommunicationChannel {
  id: string;
  token: string;
  type: 'telegram_chatbot' | 'site_widget';
}

interface AssistantSettingsState {
  selectedAssistant: Assistant | null;
  temperature: number;
  topP: number;
  topK: number;
  model: string;
  responseTime: string;
  communicationChannels: CommunicationChannel[];
  role: 'consultant' | 'assistant';
  instruction: File | null;
}

const initialState: AssistantSettingsState = {
  selectedAssistant: null,
  temperature: 0.4,
  topP: 0.7,
  topK: 0.0,
  model: 'GPT-4o',
  responseTime: '1',
  communicationChannels: [],
  role: 'consultant',
  instruction: null,
};

const assistantSettingsSlice = createSlice({
  name: 'assistantSettings',
  initialState,
  reducers: {
    setSelectedAssistant: (state, action: PayloadAction<Assistant | null>) => {
      state.selectedAssistant = action.payload;
    },
    setTemperature: (state, action: PayloadAction<number>) => {
      state.temperature = action.payload;
    },
    setTopP: (state, action: PayloadAction<number>) => {
      state.topP = action.payload;
    },
    setTopK: (state, action: PayloadAction<number>) => {
      state.topK = action.payload;
    },
    setModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload;
    },
    setResponseTime: (state, action: PayloadAction<string>) => {
      state.responseTime = action.payload;
    },
    setCommunicationChannels: (
      state,
      action: PayloadAction<CommunicationChannel[]>,
    ) => {
      state.communicationChannels = action.payload;
    },
    setRole: (state, action: PayloadAction<'consultant' | 'assistant'>) => {
      state.role = action.payload;
    },
    setInstruction: (state, action: PayloadAction<File | null>) => {
      state.instruction = action.payload;
    },
    resetSettings: (state) => {
      return { ...initialState, selectedAssistant: state.selectedAssistant };
    },
  },
});

export const {
  setSelectedAssistant,
  setTemperature,
  setTopP,
  setTopK,
  setModel,
  setResponseTime,
  setCommunicationChannels,
  setRole,
  setInstruction,
  resetSettings,
} = assistantSettingsSlice.actions;

export default assistantSettingsSlice.reducer;
