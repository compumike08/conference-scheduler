import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { REDUX_ACTION_STATUS } from "../../constants/globalConstants";
import type { Location } from "../../constants/locationConstants";
import { createNewLocation, deleteLocation, editLocation, getAllLocations, getLocation, type CreateLocationRequest, type EditLocationRequest } from "../../api/locationAPI";

export interface LocationState {
  getAllLocationsRequestStatus: REDUX_ACTION_STATUS,
  createLocationRequestStatus: REDUX_ACTION_STATUS,
  deleteLocationRequestStatus: REDUX_ACTION_STATUS,
  getSelectedLocationRequestStatus: REDUX_ACTION_STATUS,
  editSelectedLocationRequestStatus: REDUX_ACTION_STATUS,
  locationList: Array<Location>,
  selectedLocation: Location | null
}

const initialState: LocationState = {
  getAllLocationsRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  createLocationRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  deleteLocationRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  getSelectedLocationRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  editSelectedLocationRequestStatus: REDUX_ACTION_STATUS.IDLE_STATUS,
  locationList: [],
  selectedLocation: null
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

export const deleteLocationAction = createAsyncThunk(
  "location/deleteLocationAction",
  async (locationUuid: string) => {
    return await deleteLocation(locationUuid);
  }
);

export const getLocationAction = createAsyncThunk(
  "location/getLocationAction",
  async (locationUuid: string) => {
    return await getLocation(locationUuid);
  }
);

export const editLocationAction = createAsyncThunk(
  "location/editLocationAction",
  async (data: EditLocationRequest) => {
    return await editLocation(data);
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
    },
    clearSelectedLocation: (state) => {
      state.getSelectedLocationRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS;
      state.editSelectedLocationRequestStatus = REDUX_ACTION_STATUS.IDLE_STATUS; 
      state.selectedLocation = null;
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
      })
      .addCase(deleteLocationAction.fulfilled, (state, action: PayloadAction<Location>) => {
        state.getAllLocationsRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.locationList = state.locationList.filter(location => location.locationUuid !== action.payload.locationUuid);
      })
      .addCase(deleteLocationAction.pending, (state) => {
        state.getAllLocationsRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(deleteLocationAction.rejected, (state) => {
        state.getAllLocationsRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      })
      .addCase(getLocationAction.fulfilled, (state, action: PayloadAction<Location>) => {
        state.getSelectedLocationRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.selectedLocation = action.payload;
      })
      .addCase(getLocationAction.pending, (state) => {
        state.getSelectedLocationRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(getLocationAction.rejected, (state) => {
        state.getSelectedLocationRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      })
      .addCase(editLocationAction.fulfilled, (state, action: PayloadAction<Location>) => {
        state.editSelectedLocationRequestStatus = REDUX_ACTION_STATUS.SUCCESS_STATUS;
        state.selectedLocation = action.payload;
      })
      .addCase(editLocationAction.pending, (state) => {
        state.editSelectedLocationRequestStatus = REDUX_ACTION_STATUS.PENDING_STATUS;
      })
      .addCase(editLocationAction.rejected, (state) => {
        state.editSelectedLocationRequestStatus = REDUX_ACTION_STATUS.ERROR_STATUS;
      });
  }
});

export const { clearLocationsList, resetCreateNewLocationStatus, clearSelectedLocation } = locationSlice.actions;

export default locationSlice.reducer;
