import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  phone: '',
  otpCode: '',
  session_name: '',
  isLoading: false,
  isPhoneValid: false,
  error: null,
};

const telegramAccountSlice = createSlice({
  name: 'telegramAccount',
  initialState,
  reducers: {
    setPhone: (state, action) => {
      (state.phone = action.payload), (state.isPhoneValid = true);
    },
    setOtpCode: (state, action) => {
      state.otpCode = action.payload;
    },
    setSessionName: (state, action) => {
      state.session_name = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setPhone, setLoading, setOtpCode, setSessionName } =
  telegramAccountSlice.actions;
export default telegramAccountSlice.reducer;
