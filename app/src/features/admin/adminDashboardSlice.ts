import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { REDUX_ACTION_STATUS } from '../../constants/globalConstants';
import { searchByUsername, type UserRequestResponse } from '../../api/userAPI';

export interface AdminDashboardState {
  searchByUsernameRequestStatus: REDUX_ACTION_STATUS,
  matchingUsersList: Array<UserRequestResponse>
}

const initialState: AdminDashboardState = {
  searchByUsernameRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  matchingUsersList: []
};

export const searchByUsernameAction = createAsyncThunk(
  "adminDashboard/searchByUsernameAction",
  async (searchUsername: string) => {
    return await searchByUsername(searchUsername);
  }
);

export const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearSearchByUsernameResults: (state) => {
      state.searchByUsernameRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.matchingUsersList = [];
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
      });
  }
});

export const { clearSearchByUsernameResults } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
