import { Backdrop, CircularProgress, Grid, Box, Stack, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useSnackbar } from "notistack";
import type { SerializedError } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import { clearEventList, getEventsInDateRangeAction, type GetEventsInDataRangeReqObj } from "./eventSlice";
import { ISO_DATE_FORMAT_PATTERN, READABLE_DATE_ONLY_FORMAT_PATTERN, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import { selectEventListWithIdAndFiltered } from "./eventSelectors";
import EventCard from "./EventCard";

function EventList() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const [dayOneDate, setDayOneDate] = useState<Dayjs | null>(dayjs().startOf('date'));

  const dayTwoDate: Dayjs | null =  dayOneDate !== null && dayOneDate !== undefined ? dayOneDate.startOf('date').add(1, 'day') : null;
  const dayThreeDate: Dayjs | null = dayOneDate !== null && dayOneDate !== undefined ? dayOneDate.startOf('date').add(2, 'day') : null;
  const dayFourDate: Dayjs | null = dayOneDate !== null && dayOneDate !== undefined ? dayOneDate.startOf('date').add(3, 'day') : null;

  const dayOneEventList = useAppSelector((state: RootState) => selectEventListWithIdAndFiltered(state, dayOneDate || dayjs()));
  const dayTwoEventList = useAppSelector((state: RootState) => selectEventListWithIdAndFiltered(state, dayTwoDate || dayjs()));
  const dayThreeEventList = useAppSelector((state: RootState) => selectEventListWithIdAndFiltered(state, dayThreeDate || dayjs()));
  const dayFourEventList = useAppSelector((state: RootState) => selectEventListWithIdAndFiltered(state, dayFourDate || dayjs()));

  useEffect(() => {
    // Clean up on unmount
    return () => {
      dispatch(clearEventList());
    }
  }, []);

  useEffect(() => {
    getEventsInDateRange();
  }, [dayOneDate]);

  const getEventsInDateRange = async () => {
    if (dayOneDate !== null && dayOneDate !== undefined && dayFourDate !== null && dayFourDate !== undefined) {
      const data: GetEventsInDataRangeReqObj = {
        startDate: dayOneDate?.format(ISO_DATE_FORMAT_PATTERN),
        endDate: dayFourDate?.endOf('date').format(ISO_DATE_FORMAT_PATTERN)
      }

      try {
        await dispatch(getEventsInDateRangeAction(data)).unwrap();
      } catch (err) {
        const error = err as SerializedError;

        if (error.message && error.message.length > 0) {
          enqueueSnackbar(error.message, { variant: "error" });
        } else {
          console.log(error);
          enqueueSnackbar(UNKNOWN_ERR_MSG, { variant: "error" });
        }
      }
    }
  };

  const isAllDatesSet = () => {
    return dayOneDate !== null && dayOneDate !== undefined &&
      dayTwoDate !== null && dayTwoDate !== undefined &&
      dayThreeDate !== null && dayThreeDate !== undefined &&
      dayFourDate !== null && dayFourDate !== undefined;
  };

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={false}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container>
        <Grid
          sx={{
            xs: 12
          }}
        >
          <Typography variant="h5" component="div" sx={{
            marginTop: 2
          }}>
            Events
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid
          sx={{
            xs: 12
          }}
        >
          <Box sx={{
            marginTop: 2
          }}>
            <DatePicker
              label="Select Date"
              value={dayOneDate}
              onChange={setDayOneDate}
            />
          </Box>
        </Grid>
      </Grid>
      {isAllDatesSet() && (
        <Grid container>
          <Grid size={{
            xs: 12,
            md: 3
          }}>
            <Box>
              <Stack spacing={2} sx={{
                marginTop: 2
              }}>
                <Typography variant="h6">
                  {dayOneDate?.format(READABLE_DATE_ONLY_FORMAT_PATTERN)}
                </Typography>

                {dayOneEventList.map(evt => {
                  return (
                    <EventCard event={evt} key={evt.eventUuid} />
                  );
                })}
              </Stack>
            </Box>
          </Grid>
          <Grid size={{
            xs: 12,
            md: 3
          }}>
            <Box>
              <Stack spacing={2} sx={{
                marginTop: 2
              }}>
                <Typography variant="h6">
                  {dayTwoDate?.format(READABLE_DATE_ONLY_FORMAT_PATTERN)}
                </Typography>

                {dayTwoEventList.map(evt => {
                  return (
                    <EventCard event={evt} key={evt.eventUuid} />
                  );
                })}
              </Stack>
            </Box>
          </Grid>
          <Grid size={{
            xs: 12,
            md: 3
          }}>
            <Box>
              <Stack spacing={2} sx={{
                marginTop: 2
              }}>
                <Typography variant="h6">
                  {dayThreeDate?.format(READABLE_DATE_ONLY_FORMAT_PATTERN)}
                </Typography>

                {dayThreeEventList.map(evt => {
                  return (
                    <EventCard event={evt} key={evt.eventUuid} />
                  );
                })}
              </Stack>
            </Box>
          </Grid>
          <Grid size={{
            xs: 12,
            md: 3
          }}>
            <Box>
              <Stack spacing={2} sx={{
                marginTop: 2
              }}>
                <Typography variant="h6">
                  {dayFourDate?.format(READABLE_DATE_ONLY_FORMAT_PATTERN)}
                </Typography>

                {dayFourEventList.map(evt => {
                  return (
                    <EventCard event={evt} key={evt.eventUuid} />
                  );
                })}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default EventList;
