import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const selectLocationList = (state: RootState) => state.location.locationList;

export const selectLocationListWithId = createSelector(
  [selectLocationList],
  (locationsList) => {
    return locationsList.map(location => ({
      id: location.locationUuid,
      ...location
    }));
  }
);
