import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { REDUX_ACTION_STATUS } from '../../constants/globalConstants';
import { addRoleToUser, getUserByUuid, searchByUsername, type AddRoleToUserRequest, type UserRequestResponse } from '../../api/userAPI';

export interface AdminDashboardState {
  searchByUsernameRequestStatus: REDUX_ACTION_STATUS,
  getSelectedUserRequestStatus: REDUX_ACTION_STATUS,
  addRoleToSelectedUserRequestStatus: REDUX_ACTION_STATUS,
  matchingUsersList: Array<UserRequestResponse>,
  selectedUser: UserRequestResponse | null;
}

const initialState: AdminDashboardState = {
  searchByUsernameRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  getSelectedUserRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  addRoleToSelectedUserRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  matchingUsersList: [],
  selectedUser: null
};

export const searchByUsernameAction = createAsyncThunk(
  "adminDashboard/searchByUsernameAction",
  async (searchUsername: string) => {
    return await searchByUsername(searchUsername);
  }
);

export const getSelectedUserAction = createAsyncThunk(
  "adminDashboard/getSelectedUserAction",
  async (searchUuid: string) => {
    return await getUserByUuid(searchUuid);
  }
);

export const addRoleToSelectedUserAction = createAsyncThunk(
  "adminDashboard/addRoleToSelectedUserAction",
  async (data: AddRoleToUserRequest) => {
    return await addRoleToUser(data);
  }
);

export const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearSearchByUsernameResults: (state) => {
      state.searchByUsernameRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.matchingUsersList = [];
    },
    clearGetSelectedUserResults: (state) => {
      state.getSelectedUserRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.selectedUser = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchByUsernameAction.fulfilled, (state, action: PayloadAction<Array<UserRequestResponse>>) => {
        state.searchByUsernameRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.matchingUsersList = action.payload;
      })
      .addCase(searchByUsernameAction.pending, (state) => {
        state.searchByUsernameRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(searchByUsernameAction.rejected, (state) => {
        state.searchByUsernameRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      })
      .addCase(getSelectedUserAction.fulfilled, (state, action: PayloadAction<UserRequestResponse>) => {
        state.getSelectedUserRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.selectedUser = action.payload;
      })
      .addCase(getSelectedUserAction.pending, (state) => {
        state.getSelectedUserRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(getSelectedUserAction.rejected, (state) => {
        state.getSelectedUserRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      })
      .addCase(addRoleToSelectedUserAction.fulfilled, (state, action: PayloadAction<UserRequestResponse>) => {
        state.addRoleToSelectedUserRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.selectedUser = action.payload;
      })
      .addCase(addRoleToSelectedUserAction.pending, (state) => {
        state.addRoleToSelectedUserRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(addRoleToSelectedUserAction.rejected, (state) => {
        state.addRoleToSelectedUserRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export const { clearSearchByUsernameResults, clearGetSelectedUserResults } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
