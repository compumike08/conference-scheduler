import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { REDUX_ACTION_STATUS } from '../../constants/globalConstants';
import { addRoleToUser, getUserByUuid, removeRoleFromUser, searchByUsername, searchByUserRole, type EditRoleForUserRequest, type UserRequestResponse } from '../../api/userAPI';

export interface AdminDashboardState {
  searchByUsernameRequestStatus: REDUX_ACTION_STATUS,
  searchByUserRoleRequestStatus: REDUX_ACTION_STATUS,
  getSelectedUserRequestStatus: REDUX_ACTION_STATUS,
  addRoleToSelectedUserRequestStatus: REDUX_ACTION_STATUS,
  removeRoleFromSelectedUserRequestStatus: REDUX_ACTION_STATUS,
  matchingUsersList: Array<UserRequestResponse>,
  selectedUser: UserRequestResponse | null;
}

const initialState: AdminDashboardState = {
  searchByUsernameRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  searchByUserRoleRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  getSelectedUserRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  addRoleToSelectedUserRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  removeRoleFromSelectedUserRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  matchingUsersList: [],
  selectedUser: null
};

export const searchByUsernameAction = createAsyncThunk(
  "adminDashboard/searchByUsernameAction",
  async (searchUsername: string) => {
    return await searchByUsername(searchUsername);
  }
);

export const searchByUserRoleAction = createAsyncThunk(
  "adminDashboard/searchByUserRoleAction",
  async (searchRole: string) => {
    return await searchByUserRole(searchRole);
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
  async (data: EditRoleForUserRequest) => {
    return await addRoleToUser(data);
  }
);

export const removeRoleFromSelectedUserAction = createAsyncThunk(
  "adminDashboard/removeRoleFromSelectedUserAction",
  async (data: EditRoleForUserRequest) => {
    return await removeRoleFromUser(data);
  }
);

export const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearSearchForUsersResults: (state) => {
      state.searchByUsernameRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.searchByUserRoleRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
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
      .addCase(searchByUserRoleAction.fulfilled, (state, action: PayloadAction<Array<UserRequestResponse>>) => {
        state.searchByUserRoleRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.matchingUsersList = action.payload;
      })
      .addCase(searchByUserRoleAction.pending, (state) => {
        state.searchByUserRoleRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(searchByUserRoleAction.rejected, (state) => {
        state.searchByUserRoleRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
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
      })
      .addCase(removeRoleFromSelectedUserAction.fulfilled, (state, action: PayloadAction<UserRequestResponse>) => {
        state.removeRoleFromSelectedUserRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.selectedUser = action.payload;
      })
      .addCase(removeRoleFromSelectedUserAction.pending, (state) => {
        state.removeRoleFromSelectedUserRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(removeRoleFromSelectedUserAction.rejected, (state) => {
        state.removeRoleFromSelectedUserRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export const { clearSearchForUsersResults, clearGetSelectedUserResults } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
