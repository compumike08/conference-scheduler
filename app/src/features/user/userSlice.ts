import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { REDUX_ACTION_STATUS } from '../../constants/globalConstants';
import type { UserRequestResponse } from '../../api/userAPI';
import { getCurrentUser } from '../../api/userAPI';
import { logoutAction } from '../login/loginSlice';

export interface UserState {
    getCurrentUserStatus: REDUX_ACTION_STATUS,
    currentUser: UserRequestResponse | null
}

const initialState: UserState = {
    getCurrentUserStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
    currentUser: null
};

export const getCurrentUserAction = createAsyncThunk(
  "user/getCurrentUserAction",
  async () => {
    return await getCurrentUser();
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentUserAction.fulfilled, (state, action: PayloadAction<UserRequestResponse>) => {
        state.getCurrentUserStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.currentUser = action.payload;
      })
      .addCase(getCurrentUserAction.pending, (state) => {
        state.getCurrentUserStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(getCurrentUserAction.rejected, (state) => {
        state.getCurrentUserStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.getCurrentUserStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
        state.currentUser = null;
      });
  }
});

export default userSlice.reducer;
