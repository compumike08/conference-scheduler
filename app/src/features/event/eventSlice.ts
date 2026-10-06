import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { REDUX_ACTION_STATUS } from "../../constants/globalConstants";
import type { RawEvent } from "../../constants/eventConstants";
import { getEventsInDateRange } from "../../api/eventAPI";

export interface EventState {
  getEventsInDateRangeRequestStatus: REDUX_ACTION_STATUS,
  eventList: Array<RawEvent>
}

const initialState: EventState = {
  getEventsInDateRangeRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  eventList: []
};

export interface GetEventsInDataRangeReqObj {
  startDate: string,
  endDate: string
}

export const getEventsInDateRangeAction = createAsyncThunk(
  'event/getEventsInDateRangeAction',
  async (data: GetEventsInDataRangeReqObj) => {
    return await getEventsInDateRange(data.startDate, data.endDate);
  }
);

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    clearEventList: (state) => {
      state.getEventsInDateRangeRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.eventList = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getEventsInDateRangeAction.fulfilled, (state, action: PayloadAction<Array<RawEvent>>) => {
        state.getEventsInDateRangeRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.eventList = action.payload;
      })
      .addCase(getEventsInDateRangeAction.pending, (state) => {
        state.getEventsInDateRangeRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(getEventsInDateRangeAction.rejected, (state) => {
        state.getEventsInDateRangeRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export const { clearEventList } = eventSlice.actions;

export default eventSlice.reducer;
