import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: [],
  isLoading: false,
  error: null,
  selectedAssistant: null,
};

const assistantSlice = createSlice({
  name: 'assistants',
  initialState,
  reducers: {
    setSelectAssistant: (state, action) => {
      state.selectedAssistant = action.payload;
    },
    addAssistant: (state, action: any) => {
      //@ts-ignore
      state.data.push(action.payload);
    },
    delAssistant: (state, action) => {
      //@ts-ignore
      state.data = state.data.filter((item) => item.id !== action.payload.id);
      state.selectedAssistant = null;
    },
    updateAssistantsData: (state, action) => {
      state.data = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  addAssistant,
  setSelectAssistant,
  delAssistant,
  updateAssistantsData,
  setLoading,
  setError,
} = assistantSlice.actions;
export default assistantSlice.reducer;
