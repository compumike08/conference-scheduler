import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authenticate, type LoginRequest, type LoginResponse } from '../../api/authAPI';
import { REDUX_ACTION_STATUS } from '../../constants/globalConstants';

export interface LoginState {
    authenticateRequestStatus: REDUX_ACTION_STATUS,
    token: string | null,
    refreshToken: string | null
}

const initialState: LoginState = {
    authenticateRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
    token: null,
    refreshToken: null
};

export const authenticateAction = createAsyncThunk(
    "auth/authenticateAction",
    async (data: LoginRequest) => {
        return await authenticate(data);
    }
);

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authenticateAction.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.authenticateRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(authenticateAction.pending, (state) => {
        state.authenticateRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(authenticateAction.rejected, (state) => {
        state.authenticateRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export default loginSlice.reducer;
