import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import dayjs, { Dayjs } from "dayjs";

const selectEventList = (state: RootState) => state.event.eventList;
const selectSelectedEvent = (state: RootState) => state.event.selectedEvent;

const selectFilterDate = (_: RootState, filterDate: Dayjs) => filterDate;

export const selectEventListWithIdAndFiltered = createSelector(
  [selectEventList, selectFilterDate],
  (eventList, filterDate) => {
    const endOfDayFilterEndDate = filterDate.endOf('date');

    return eventList.map(event => ({
      ...event,
      id: event.eventUuid,
      startDateTime: dayjs(event.startDateTime),
      endDateTime: dayjs(event.endDateTime)
    }))
      .filter(evt =>
        (evt.startDateTime.isSame(filterDate) || evt.startDateTime.isAfter(filterDate)) &&
          (evt.endDateTime.isSame(endOfDayFilterEndDate) || evt.endDateTime.isBefore(endOfDayFilterEndDate))
      );
  }
);

export const selectSelectedEventWithDayjsDates = createSelector(
  [selectSelectedEvent],
  (selectedEvent) => {
    if (selectedEvent === null) {
      return null;
    }

    return {
      ...selectedEvent,
      id: selectedEvent.eventUuid,
      startDateTime: dayjs(selectedEvent.startDateTime),
      endDateTime: dayjs(selectedEvent.endDateTime)
    };
  }
);
