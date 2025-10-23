import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface BookState {
  floor: number | null;
  unit: string;
}

const initialState: BookState = {
  floor: null,
  unit: '',
};

export const bookSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    updateFloor: (state, action: PayloadAction<number>) => {
      state.floor = action.payload;
    },
    updateUnit: (state, action: PayloadAction<string>) => {
      state.unit = action.payload;
    },
  },
});

export const { updateFloor, updateUnit } = bookSlice.actions;
export default bookSlice.reducer;
