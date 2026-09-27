import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Member } from '../../constants/memberConstants';
import { createMemberAndReturnUpdatedUser, type NewMemberRequest, type UserWithMemberResponse } from '../../api/memberAPI';
import { REDUX_ACTION_STATUS } from '../../constants/globalConstants';

export interface MemberState {
  createMemberAndReturnUpdatedUserRequestStatus: REDUX_ACTION_STATUS,
  currentMember: Member | null
}

const initialState: MemberState = {
  createMemberAndReturnUpdatedUserRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  currentMember: null
};

export const createMemberAndReturnUpdatedUserAction = createAsyncThunk(
  "member/createMemberAndReturnUpdatedUserAction",
  async (data: NewMemberRequest) => {
    return await createMemberAndReturnUpdatedUser(data);
  }
);

export const memberSlice = createSlice({
  name: "member",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createMemberAndReturnUpdatedUserAction.fulfilled, (state, action: PayloadAction<UserWithMemberResponse>) => {
        state.createMemberAndReturnUpdatedUserRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.currentMember = action.payload.member;
      })
      .addCase(createMemberAndReturnUpdatedUserAction.pending, (state) => {
        state.createMemberAndReturnUpdatedUserRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(createMemberAndReturnUpdatedUserAction.rejected, (state) => {
        state.createMemberAndReturnUpdatedUserRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export default memberSlice.reducer;
