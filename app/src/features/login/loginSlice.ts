import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authenticate, logout, type LoginRequest } from '../../api/authAPI';
import { REDUX_ACTION_STATUS } from '../../constants/globalConstants';

export interface LoginState {
    authenticateRequestStatus: REDUX_ACTION_STATUS,
    logoutRequestStatus: REDUX_ACTION_STATUS,
    isLoggedIn: boolean
}

const initialState: LoginState = {
    authenticateRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
    logoutRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
    isLoggedIn: false
};

export const authenticateAction = createAsyncThunk(
    "auth/authenticateAction",
    async (data: LoginRequest) => {
        return await authenticate(data);
    }
);

export const logoutAction = createAsyncThunk(
  "auth/logoutAction",
  async () => {
    return await logout();
  }
);

export const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(authenticateAction.fulfilled, (state) => {
        state.authenticateRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.isLoggedIn = true;
      })
      .addCase(authenticateAction.pending, (state) => {
        state.authenticateRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(authenticateAction.rejected, (state) => {
        state.authenticateRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.logoutRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.isLoggedIn = false;
      })
      .addCase(logoutAction.pending, (state) => {
        state.logoutRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(logoutAction.rejected, (state) => {
        state.logoutRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
        state.isLoggedIn = false;
      });
  }
});

export default loginSlice.reducer;
