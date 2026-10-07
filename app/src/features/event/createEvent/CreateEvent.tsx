import { Backdrop, CircularProgress, Grid, Box, Stack, Typography, Alert, FormControl, InputLabel, Input, FormHelperText, Button, Select, MenuItem, type SelectChangeEvent } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useEffect, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { SerializedError } from "@reduxjs/toolkit";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { ISO_DATE_FORMAT_PATTERN, REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../../constants/globalConstants";
import NumberSpinner from "../../../shared/NumberSpinner";
import { useAppDispatch, useAppSelector, type RootState } from "../../../app/store";
import { clearLocationsList, getAllLocationsAction } from "../../location/locationSlice";
import { selectLocationListWithId } from "../../location/locationSelectors";
import { clearEventList, createNewEventAction } from "../eventSlice";
import type { NewEventRequest } from "../../../api/eventAPI";

function CreateEvent() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const locationsList = useAppSelector((state: RootState) => selectLocationListWithId(state));
  const { getAllLocationsRequestStatus } = useAppSelector((state: RootState) => state.location);
  const { createNewEventRequestStatus } = useAppSelector((state: RootState) => state.event);

  const [eventTitle, setEventTitle] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(1);
  const [selectedStartDateTime, setSelectedStartDateTime] = useState<Dayjs | null>(dayjs().add(1, "minute"));
  const [selectedEndDateTime, setSelectedEndDateTime] = useState<Dayjs | null>(dayjs().add(1, "minute").add(1, "hour"));
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [eventDescription, setEventDescription] = useState("");

  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  const [eventTitleValidationErrMsg, setEventTitleValidationErrMsg] = useState<string | null>(null);
  const [maxAttendeesValidationErrMsg, setMaxAttendeesValidationErrMsg] = useState<string | null>(null);
  const [selectedStartDateTimeValidationErrMsg, setSelectedStartDateTimeValidationErrMsg] = useState<string | null>(null);
  const [selectedEndDateTimeValidationErrMsg, setSelectedEndDateTimeValidationErrMsg] = useState<string | null>(null);
  const [locationValidationErrorMsg, setLocationValidationErrorMsg] = useState<string | null>(null);
  const [eventDescriptionValidationErrMsg, setEventDescriptionValidationErrMsg] = useState<string | null>(null);

  useEffect(() => {
    const getAllLocationsFunc = async () => {
      try {
        await dispatch(getAllLocationsAction()).unwrap();
      } catch (err) {
        const error = err as SerializedError;
        setIsServerError(true);

        if (error.message && error.message.length > 0) {
          setServerErrorMsg(error.message);
        } else {
          console.log(error);
          setServerErrorMsg(UNKNOWN_ERR_MSG);
        }
      }
    };

    getAllLocationsFunc();

    // Clear locations list Redux state when component unmounts
    return () => {
      dispatch(clearLocationsList());
      dispatch(clearEventList());
    };
  }, []);

  const handleMaxAttendeesChange = (value: number | null) => {
    setMaxAttendees(value || 1);
  }

  const reinitializeAllOfForm = () => {
    reintializeErrors();
    reinitializeFormValues();
  };

  const reintializeErrors = () => {
    setIsServerError(false);
    setServerErrorMsg("");
  };

  const reinitializeFormValues = () => {
    setEventTitle("");
    setMaxAttendees(1);
    setSelectedStartDateTime(dayjs().add(1, "minute"));
    setSelectedEndDateTime(dayjs().add(1, "minute").add(1, "hour"));
    setSelectedLocation(null);
    setEventDescription("");

    resetFrontendValidationErrors();
  };

  const resetFrontendValidationErrors = () => {
    setEventTitleValidationErrMsg(null);
    setMaxAttendeesValidationErrMsg(null);
    setSelectedStartDateTimeValidationErrMsg(null);
    setSelectedEndDateTimeValidationErrMsg(null);
    setLocationValidationErrorMsg(null);
    setEventDescriptionValidationErrMsg(null);
  };

  const handleStartDateTimeChange = (value: Dayjs | null) => {
    setSelectedStartDateTime(value);
  };

  const handleEndDateTimeChange = (value: Dayjs | null) => {
    setSelectedEndDateTime(value);
  };

  const handleChangeLocationSelection = (event: SelectChangeEvent<string | null>) => {
    setSelectedLocation(event.target.value);
  };

  const handleOnSubmit = async () => {
    reintializeErrors();
    resetFrontendValidationErrors();

    let isFrontendError = false;
    const currentDateTime = dayjs();

    if (eventTitle.length < 1 || eventTitle.length > 100) {
      setEventTitleValidationErrMsg("Event Title must be between 1 and 100 characters long");
      isFrontendError = true;
    }

    if (selectedStartDateTime === null || selectedStartDateTime === undefined) {
      setSelectedStartDateTimeValidationErrMsg("Start Date/Time is required");
      isFrontendError = true;
    }

    if (selectedStartDateTime?.isBefore(currentDateTime) || selectedStartDateTime?.isSame(currentDateTime)) {
      setSelectedStartDateTimeValidationErrMsg("Start Date/Time must be after the current date/time");
      isFrontendError = true;
    }

    if (selectedEndDateTime === null || selectedEndDateTime === undefined) {
      setSelectedEndDateTimeValidationErrMsg("End Date/Time is required");
      isFrontendError = true;
    }

    if (selectedEndDateTime?.isBefore(currentDateTime) || selectedEndDateTime?.isSame(currentDateTime)) {
      setSelectedEndDateTimeValidationErrMsg("End Date/Time must be after the current date/time");
      isFrontendError = true;
    }

    if (selectedEndDateTime?.isSame(selectedStartDateTime) || selectedEndDateTime?.isBefore(selectedStartDateTime)) {
      setSelectedEndDateTimeValidationErrMsg("End Date/Time must be after Start Date/Time");
      isFrontendError = true;
    }

    if (selectedLocation === null) {
      setLocationValidationErrorMsg("Location is required");
      isFrontendError = true;
    }

    if (isFrontendError || selectedStartDateTime === null || selectedEndDateTime === null || selectedLocation === null) {
      return;
    }

    const data: NewEventRequest = {
      title: eventTitle,
      description: eventDescription,
      maxAttendees,
      startDateTime: selectedStartDateTime.format(ISO_DATE_FORMAT_PATTERN),
      endDateTime: selectedEndDateTime.format(ISO_DATE_FORMAT_PATTERN),
      locationUuid: selectedLocation
    };

    try {
      const response = await dispatch(createNewEventAction(data)).unwrap();

      enqueueSnackbar(`New event ${response.title} created`, { variant: "success" });
      navigate("/eventList");
    } catch (err) {
      const error = err as SerializedError;
      setIsServerError(true);

      if (error.message && error.message.length > 0) {
        setServerErrorMsg(error.message);
      } else {
        console.log(error);
        setServerErrorMsg(UNKNOWN_ERR_MSG);
      }
    }
  };

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={getAllLocationsRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS || createNewEventRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container sx={{
        justifyContent: "center"
      }}>
        <Grid size={{
          xs: 12,
          sm: 8,
          md: 6,
          lg: 4
        }}>
          <Box component="form" >
            <Stack spacing={2} sx={{
              marginTop: 2
            }}>
              <Typography variant="h5" component="div">
                Create Event
              </Typography>
              
              {isServerError && (
                <Box>
                  <Alert severity="error">{serverErrorMsg}</Alert>
                </Box>
              )}

              <FormControl error={eventTitleValidationErrMsg !== null} variant="standard" fullWidth>
                <InputLabel htmlFor="input-eventTitle">Event Title</InputLabel>
                <Input
                  id="input-eventTitle"
                  value={eventTitle}
                  onChange={(evt) => {
                    const eventTitleValue = evt.target.value;

                    if (eventTitleValue.length <= 100) {
                      setEventTitle(evt.target.value);
                    }
                  }}
                />
                {eventTitleValidationErrMsg && (
                  <FormHelperText id="input-eventTitle-error">{eventTitleValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl error={maxAttendeesValidationErrMsg !== null} variant="standard" fullWidth>
                <NumberSpinner
                  label="Max Attendees"
                  min={1}
                  size="small"
                  value={maxAttendees}
                  onValueChange={handleMaxAttendeesChange}
                />
                {maxAttendeesValidationErrMsg && (
                  <FormHelperText id="input-maxAttendees-error">{maxAttendeesValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl error={selectedStartDateTimeValidationErrMsg !== null} variant="standard" fullWidth>
                <DateTimePicker
                  label="Start Date/Time"
                  disablePast
                  timeSteps={{ minutes: 1 }}
                  value={selectedStartDateTime || dayjs().add(1, "minute")}
                  onChange={handleStartDateTimeChange}
                />
                {selectedStartDateTimeValidationErrMsg && (
                  <FormHelperText>{selectedStartDateTimeValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl error={selectedEndDateTimeValidationErrMsg !== null} variant="standard" fullWidth>
                <DateTimePicker
                  label="End Date/Time"
                  disablePast
                  timeSteps={{ minutes: 1 }}
                  value={selectedEndDateTime || dayjs().add(1, "minute").add(1, "hour")}
                  onChange={handleEndDateTimeChange}
                />
                {selectedEndDateTimeValidationErrMsg && (
                  <FormHelperText>{selectedEndDateTimeValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={locationValidationErrorMsg !== null} size="small">
                <InputLabel id="input-location-label">Location</InputLabel>
                <Select
                  labelId="input-location-label"
                  id="input-location-select"
                  value={selectedLocation || ""}
                  label="Location"
                  onChange={handleChangeLocationSelection}
                >
                  {locationsList
                    .map(loc => (
                      <MenuItem key={`${loc.locationUuid}-location-select-option`} value={loc.locationUuid}>{loc.locationName}</MenuItem>
                    ))
                  }
                </Select>
                {locationValidationErrorMsg !== null && (
                  <FormHelperText id="input-location-error">{locationValidationErrorMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl error={eventDescriptionValidationErrMsg !== null} variant="standard" fullWidth>
                <InputLabel htmlFor="input-eventDescription">Description</InputLabel>
                <Input
                  id="input-eventDescription"
                  value={eventDescription}
                  multiline={true}
                  minRows={5}
                  onChange={(evt) => {
                    const eventDescriptionValue = evt.target.value;

                    if (eventDescriptionValue.length <= 2000) {
                      setEventDescription(evt.target.value);
                    }
                  }}
                />
                {eventDescriptionValidationErrMsg && (
                  <FormHelperText id="input-eventDescription-error">{eventDescriptionValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <Grid container sx={{
                justifyContent: "space-between"
              }}>
                <Button onClick={handleOnSubmit} variant="contained">Submit</Button>
                <Button onClick={reinitializeAllOfForm} variant="outlined">Cancel</Button>
              </Grid>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default CreateEvent;
