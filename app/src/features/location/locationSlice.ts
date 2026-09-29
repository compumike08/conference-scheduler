import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { REDUX_ACTION_STATUS } from "../../constants/globalConstants";
import type { Location } from "../../constants/locationConstants";
import { createNewLocation, getAllLocations, type CreateLocationRequest } from "../../api/locationAPI";

export interface LocationState {
  getAllLocationsRequestStatus: REDUX_ACTION_STATUS,
  createLocationRequestStatus: REDUX_ACTION_STATUS,
  locationList: Array<Location>
}

const initialState: LocationState = {
  getAllLocationsRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  createLocationRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  locationList: []
};

export const getAllLocationsAction = createAsyncThunk(
  "location/getAllLocationsAction",
  async () => {
    return await getAllLocations();
  }
);

export const createNewLocationAction = createAsyncThunk(
  "location/createNewLocationAction",
  async (data: CreateLocationRequest) => {
    return await createNewLocation(data);
  }
);

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearLocationsList: (state) => {
      state.getAllLocationsRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.locationList = [];
    },
    resetCreateNewLocationStatus: (state) => {
      state.createLocationRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
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
      })
      .addCase(createNewLocationAction.fulfilled, (state) => {
        state.createLocationRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
      })
      .addCase(createNewLocationAction.pending, (state) => {
        state.createLocationRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(createNewLocationAction.rejected, (state) => {
        state.createLocationRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export const { clearLocationsList, resetCreateNewLocationStatus } = locationSlice.actions;

export default locationSlice.reducer;
