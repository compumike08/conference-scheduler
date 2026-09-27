import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { registerUser, type NewUserRequest } from '../../api/registerAPI';
import { type UserRequestResponse } from '../../api/userAPI';
import type { UserRole } from '../../constants/userConstants';
import { REDUX_ACTION_STATUS } from '../../constants/globalConstants';

export interface RegisterState {
  registerUserRequestStatus: REDUX_ACTION_STATUS,
  userUuid: string,
  username: string,
  email: string,
  roles: Array<UserRole>
}

const initialState: RegisterState = {
  registerUserRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  userUuid: "",
  username: "",
  email: "",
  roles: []
};

export const registerUserAction = createAsyncThunk(
  "register/registerUserAction",
  async (data: NewUserRequest) => {
    return await registerUser(data);
  }
)

export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUserAction.fulfilled, (state, action: PayloadAction<UserRequestResponse>) => {
        state.registerUserRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.userUuid = action.payload.userUuid;
        state.username = action.payload.username;
        state.email = action.payload.email;
        state.roles = action.payload.roles;
      })
      .addCase(registerUserAction.pending, (state) => {
        state.registerUserRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(registerUserAction.rejected, (state) => {
        state.registerUserRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export default registerSlice.reducer;
