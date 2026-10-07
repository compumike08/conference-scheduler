import { type SelectChangeEvent, Backdrop, CircularProgress, Grid, Box, Stack, Typography, Alert, FormControl, InputLabel, Input, FormHelperText, Select, MenuItem, Button } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import type { SerializedError } from "@reduxjs/toolkit";
import dayjs, { Dayjs } from "dayjs";
import { useSnackbar } from "notistack";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch, useAppSelector, type RootState } from "../../../app/store";
import { UNKNOWN_ERR_MSG, REDUX_ACTION_STATUS } from "../../../constants/globalConstants";
import NumberSpinner from "../../../shared/NumberSpinner";
import { selectLocationListWithId } from "../../location/locationSelectors";
import { getAllLocationsAction, clearLocationsList } from "../../location/locationSlice";
import { clearEventList, clearGetSelectedEvent, editEventAction, getSelectedEventAction } from "../eventSlice";
import { selectSelectedEventWithDayjsDates } from "../eventSelectors";
import { UserRole } from "../../../constants/userConstants";
import type { EditEventRequest } from "../../../api/eventAPI";

function EditEvent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { eventUuid } = useParams();

  const locationsList = useAppSelector((state: RootState) => selectLocationListWithId(state));
  const { getAllLocationsRequestStatus } = useAppSelector((state: RootState) => state.location);
  const { getSelectedEventRequestStatus, editSelectedEventRequestStatus } = useAppSelector((state: RootState) => state.event);
  const { currentUser } = useAppSelector((state: RootState) => state.user);
  const { roles = [] } = currentUser ?? {};
  const selectedEvent = useAppSelector((state: RootState) => selectSelectedEventWithDayjsDates(state));

  const isEditable = roles.includes(UserRole.ROLE_ADMIN) ||
    (roles.includes(UserRole.ROLE_SCHEDULER) &&
      currentUser !== null &&
      selectedEvent !== null &&
      currentUser.userUuid === selectedEvent.createdByUser.userUuid
    );

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

    // Clear related Redux state when component unmounts
    return () => {
      dispatch(clearLocationsList());
      dispatch(clearEventList());
      dispatch(clearGetSelectedEvent());
    };
  }, []);

  useEffect(() => {
    const getEventByUuidFunc = async () => {
      if (eventUuid !== undefined && eventUuid !== null) {
        try {
          await dispatch(getSelectedEventAction(eventUuid)).unwrap();
        } catch (err) {
          const error = err as SerializedError;

          if (error.message && error.message.length > 0) {
            enqueueSnackbar(error.message, { variant: "error" });
          } else {
            console.log(error);
            enqueueSnackbar(UNKNOWN_ERR_MSG, { variant: "error" });
          }
        } 
      } else {
        throw new Error("Variable eventUuid was null/undefined when EditEvent useEffect triggered");
      }
    };

    getEventByUuidFunc();
  }, [eventUuid]);

  useEffect(() => {
    reinitializeAllOfForm();
  }, [selectedEvent]);

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
    if (selectedEvent) {
      setEventTitle(selectedEvent.title);
      setMaxAttendees(selectedEvent.maxAttendees);
      setSelectedStartDateTime(selectedEvent.startDateTime);
      setSelectedEndDateTime(selectedEvent.endDateTime);
      setSelectedLocation(selectedEvent.location.locationUuid);
      setEventDescription(selectedEvent.description);
    } else {
      setEventTitle("");
      setMaxAttendees(1);
      setSelectedStartDateTime(dayjs().add(1, "minute"));
      setSelectedEndDateTime(dayjs().add(1, "minute").add(1, "hour"));
      setSelectedLocation(null);
      setEventDescription("");
    }

    resetFrontendValidationErrors();
  };

  const resetFrontendValidationErrors = () => {
    setEventTitleValidationErrMsg(null);
    setMaxAttendeesValidationErrMsg(null);
    setLocationValidationErrorMsg(null);
    setEventDescriptionValidationErrMsg(null);
  };

  const handleChangeLocationSelection = (event: SelectChangeEvent<string | null>) => {
    setSelectedLocation(event.target.value);
  };

  const handleOnSubmit = async () => {
    if (!isEditable || !eventUuid) {
      return;
    }

    reintializeErrors();
    resetFrontendValidationErrors();

    let isFrontendError = false;
    if (eventTitle.length < 1 || eventTitle.length > 100) {
      setEventTitleValidationErrMsg("Event Title must be between 1 and 100 characters long");
      isFrontendError = true;
    }

    if (selectedLocation === null) {
      setLocationValidationErrorMsg("Location is required");
      isFrontendError = true;
    }

    if (isFrontendError || selectedStartDateTime === null || selectedEndDateTime === null || selectedLocation === null) {
      return;
    }

    const data: EditEventRequest = {
      eventUuid,
      title: eventTitle,
      description: eventDescription,
      maxAttendees,
      locationUuid: selectedLocation
    };

    try {
      const response = await dispatch(editEventAction(data)).unwrap();

      enqueueSnackbar(`Event ${response.title} edited successfully`, { variant: "success" });
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
        open={
          getAllLocationsRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS ||
          getSelectedEventRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS ||
          editSelectedEventRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS
        }
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
                {isEditable ? "Edit Event" : "View Event"}
              </Typography>
              
              {isServerError && (
                <Box>
                  <Alert severity="error">{serverErrorMsg}</Alert>
                </Box>
              )}

              <FormControl error={eventTitleValidationErrMsg !== null} variant="standard" fullWidth>
                <InputLabel htmlFor="input-eventTitle">{isEditable ? "Event Title" : "Event Title (read only)"}</InputLabel>
                <Input
                  id="input-eventTitle"
                  value={eventTitle}
                  readOnly={!isEditable}
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
                  label={isEditable ? "Max Attendees" : "Max Attendees (read only)"}
                  min={1}
                  size="small"
                  value={maxAttendees}
                  readOnly={!isEditable}
                  onValueChange={handleMaxAttendeesChange}
                />
                {maxAttendeesValidationErrMsg && (
                  <FormHelperText id="input-maxAttendees-error">{maxAttendeesValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <DateTimePicker
                  label="Start Date/Time (read only)"
                  readOnly
                  value={selectedStartDateTime}
                />
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <DateTimePicker
                  label="End Date/Time (read only)"
                  readOnly
                  value={selectedEndDateTime}
                />
              </FormControl>

              <FormControl fullWidth error={locationValidationErrorMsg !== null} size="small">
                <InputLabel id="input-location-label">{isEditable ? "Location" : "Location (read only)"}</InputLabel>
                <Select
                  labelId="input-location-label"
                  id="input-location-select"
                  value={selectedLocation || ""}
                  label={isEditable ? "Location" : "Location (read only)"}
                  readOnly={!isEditable}
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
                <InputLabel htmlFor="input-eventDescription">{isEditable ? "Description" : "Description (read only)"}</InputLabel>
                <Input
                  id="input-eventDescription"
                  value={eventDescription}
                  multiline={true}
                  readOnly={!isEditable}
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

              {isEditable && (
                <Grid container sx={{
                  justifyContent: "space-between"
                }}>
                  <Button onClick={handleOnSubmit} variant="contained">Submit</Button>
                  <Button onClick={reinitializeAllOfForm} variant="outlined">Cancel</Button>
                </Grid>
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default EditEvent;
