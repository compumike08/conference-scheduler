import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { REDUX_ACTION_STATUS } from "../../constants/globalConstants";
import type { RawEvent } from "../../constants/eventConstants";
import { createNewEvent, editEvent, getEventByUuid, getEventsInDateRange, type EditEventRequest, type NewEventRequest } from "../../api/eventAPI";

export interface EventState {
  getEventsInDateRangeRequestStatus: REDUX_ACTION_STATUS,
  createNewEventRequestStatus: REDUX_ACTION_STATUS,
  getSelectedEventRequestStatus: REDUX_ACTION_STATUS,
  editSelectedEventRequestStatus: REDUX_ACTION_STATUS,
  eventList: Array<RawEvent>,
  selectedEvent: RawEvent | null
}

const initialState: EventState = {
  getEventsInDateRangeRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  createNewEventRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  getSelectedEventRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  editSelectedEventRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  eventList: [],
  selectedEvent: null
};

export interface GetEventsInDataRangeReqObj {
  startDate: string,
  endDate: string
}

export const getSelectedEventAction = createAsyncThunk(
  'event/getSelectedEventAction',
  async (eventUuid: string) => {
    return await getEventByUuid(eventUuid);
  }
);

export const getEventsInDateRangeAction = createAsyncThunk(
  'event/getEventsInDateRangeAction',
  async (data: GetEventsInDataRangeReqObj) => {
    return await getEventsInDateRange(data.startDate, data.endDate);
  }
);

export const createNewEventAction = createAsyncThunk(
  'event/createNewEventAction',
  async (data: NewEventRequest) => {
    return await createNewEvent(data);
  }
);

export const editEventAction = createAsyncThunk(
  'event/editEventAction',
  async (data: EditEventRequest) => {
    return await editEvent(data);
  }
);

export const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    clearEventList: (state) => {
      state.getEventsInDateRangeRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.createNewEventRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.eventList = [];
    },
    clearGetSelectedEvent: (state) => {
      state.getSelectedEventRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.selectedEvent = null;
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
      })
      .addCase(createNewEventAction.fulfilled, (state) => {
        state.createNewEventRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
      })
      .addCase(createNewEventAction.pending, (state) => {
        state.createNewEventRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(createNewEventAction.rejected, (state) => {
        state.createNewEventRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      })
      .addCase(getSelectedEventAction.fulfilled, (state, action: PayloadAction<RawEvent>) => {
        state.getSelectedEventRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.selectedEvent = action.payload;
      })
      .addCase(getSelectedEventAction.pending, (state) => {
        state.getSelectedEventRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(getSelectedEventAction.rejected, (state) => {
        state.getSelectedEventRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      })
      .addCase(editEventAction.fulfilled, (state) => {
        state.editSelectedEventRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
      })
      .addCase(editEventAction.pending, (state) => {
        state.editSelectedEventRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(editEventAction.rejected, (state) => {
        state.editSelectedEventRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export const { clearEventList, clearGetSelectedEvent } = eventSlice.actions;

export default eventSlice.reducer;
