import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { REDUX_ACTION_STATUS } from "../../constants/globalConstants";
import type { Location } from "../../constants/locationConstants";
import { getAllLocations } from "../../api/locationAPI";

export interface LocationState {
  getAllLocationsRequestStatus: REDUX_ACTION_STATUS,
  locationList: Array<Location>
}

const initialState: LocationState = {
  getAllLocationsRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  locationList: []
};

export const getAllLocationsAction = createAsyncThunk(
  "location/getAllLocationsAction",
  async () => {
    return await getAllLocations();
  }
);

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearLocationsList: (state) => {
      state.getAllLocationsRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.locationList = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLocationsAction.fulfilled, (state, action: PayloadAction<Array<Location>>) => {
        state.getAllLocationsRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.locationList = action.payload;
      })
      .addCase(getAllLocationsAction.pending, (state) => {
        state.getAllLocationsRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(getAllLocationsAction.rejected, (state) => {
        state.getAllLocationsRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export const { clearLocationsList } = locationSlice.actions;

export default locationSlice.reducer;
