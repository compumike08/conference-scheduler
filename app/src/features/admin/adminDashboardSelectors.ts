import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const selectMatchingUsersList = (state: RootState) => state.adminDashboard.matchingUsersList;

export const selectMatchingUsersListWithId = createSelector(
  [selectMatchingUsersList],
  (matchingUsersList) => {
    return matchingUsersList.map(user => ({
      id: user.userUuid,
      ...user
    }));
  }
);
