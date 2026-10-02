import { Backdrop, CircularProgress, Grid, Box, Stack, Typography, Alert, Button, FormControl, FormHelperText, Input, InputLabel } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import type { SerializedError } from "@reduxjs/toolkit";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../../constants/globalConstants";
import { useAppDispatch, useAppSelector, type RootState } from "../../../app/store";
import { clearSelectedLocation, editLocationAction, getLocationAction } from "../locationSlice";
import NumberSpinner from "../../../shared/NumberSpinner";
import type { EditLocationRequest } from "../../../api/locationAPI";

function EditLocation() {
  const { locationUuid } = useParams();
  const dispatch = useAppDispatch();
  const { getSelectedLocationRequestStatus, selectedLocation } = useAppSelector((state: RootState) => state.location);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");
  const [locationName, setLocationName] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [locationDescription, setLocationDescription] = useState("");
  const [locationNameValidationErrMsg, setLocationNameValidationErrMsg] = useState<string | null>(null);
  const [capacityValidationErrMsg, setCapacityValidationErrMsg] = useState<string | null>(null);
  const [locationDescriptionValidationErrMsg, setLocationDescriptionValidationErrMsg] = useState<string | null>(null);

  const reinitializeAllOfForm = () => {
    reinitializeErrors();
    reinitializeFormValues();
  }

  const reinitializeErrors = () => {
    setIsServerError(false);
    setServerErrorMsg("");
  };

  const reinitializeFormValues = () => {
    if (selectedLocation) {
      setLocationName(selectedLocation.locationName);
      setCapacity(selectedLocation.capacity);
      setLocationDescription(selectedLocation.locationDescription);
    } else {
      setLocationName("");
      setCapacity(1);
      setLocationDescription("");
    }

    reinitializeFormValidationErrors();
  };

  const reinitializeFormValidationErrors = () => {
    setLocationNameValidationErrMsg(null);
    setCapacityValidationErrMsg(null);
    setLocationDescriptionValidationErrMsg(null);
  }

  useEffect(() => {
    // Clean up on unmount
    return () => {
      dispatch(clearSelectedLocation());
    }
  }, []);
  
  useEffect(() => {
    const getLocationFunc = async () => {
      if (locationUuid !== null && locationUuid !== undefined) {
        try {
          await dispatch(getLocationAction(locationUuid)).unwrap();
        } catch (err) {
          const error = err as SerializedError;

          if (error.message && error.message.length > 0) {
            enqueueSnackbar(error.message, { variant: "error" });
          } else {
            enqueueSnackbar(UNKNOWN_ERR_MSG, { variant: "error" });
          }
        }
      } else {
        throw new Error("Variable locationUuid was null/undefined when EditLocation useEffect triggered");
      }
    };

    getLocationFunc();
  }, [locationUuid]);

  useEffect(() => {
    reinitializeAllOfForm();
  }, [selectedLocation]);

  const handleCapacityChange = (value: number | null) => {
    setCapacity(value || 1);
  }

  const handleOnSubmit = async () => {
    reinitializeErrors();

    if (locationUuid === undefined || locationUuid === null) {
      throw new Error("Variable locationUuid was null/undefined when EditLocation handleOnSubmit triggered");
    }

    let isFrontendInvalid = false;

    if (locationName.length < 1 || locationName.length > 100) {
      setLocationNameValidationErrMsg("Location name must be between 1 and 100 characters long");
      isFrontendInvalid = true;
    }

    if (capacity === null) {
      setCapacityValidationErrMsg("Capacity is required");
      isFrontendInvalid = true;
    }

    if (capacity < 1) {
      setCapacityValidationErrMsg("Capacity must be greater than or equal to 1");
      isFrontendInvalid = true;
    }

    if (locationDescription.length > 2000) {
      setLocationDescriptionValidationErrMsg("Description must be less than or equal to 2000 characters long");
      isFrontendInvalid = true;
    }

    if (isFrontendInvalid) {
      return;
    }

    const data: EditLocationRequest = {
      locationUuid,
      locationName,
      capacity,
      locationDescription
    };

    try {
      const response = await dispatch(editLocationAction(data)).unwrap();

      enqueueSnackbar(`Location ${response.locationName} updated successfully`, { variant: "success" });
      navigate("/locationList");
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
        open={getSelectedLocationRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
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
                Edit Location
              </Typography>

              {isServerError && (
                <Box>
                  <Alert severity="error">{serverErrorMsg}</Alert>
                </Box>
              )}

              {selectedLocation !== null && (
                <>
                  <FormControl error={locationNameValidationErrMsg !== null} variant="standard" fullWidth>
                    <InputLabel htmlFor="input-locationName">Location Name</InputLabel>
                    <Input
                      id="input-locationName"
                      value={locationName}
                      onChange={(event) => {
                        const locationNameValue = event.target.value;

                        if (locationNameValue.length <= 100) {
                          setLocationName(event.target.value);
                        }
                      }}
                    />
                    {locationNameValidationErrMsg && (
                      <FormHelperText id="input-locationName-error">{locationNameValidationErrMsg}</FormHelperText>
                    )}
                  </FormControl>

                  <FormControl error={capacityValidationErrMsg !== null} variant="standard" fullWidth>
                    <NumberSpinner
                      label="Capacity"
                      min={1}
                      size="small"
                      value={capacity}
                      onValueChange={handleCapacityChange}
                    />
                    {capacityValidationErrMsg && (
                      <FormHelperText id="input-capacity-error">{capacityValidationErrMsg}</FormHelperText>
                    )}
                  </FormControl>

                  <FormControl error={locationDescriptionValidationErrMsg !== null} variant="standard" fullWidth>
                    <InputLabel htmlFor="input-locationDescription">Description</InputLabel>
                    <Input
                      id="input-locationDescription"
                      value={locationDescription}
                      multiline={true}
                      minRows={5}
                      onChange={(event) => {
                        const locationDescriptionValue = event.target.value;

                        if (locationDescriptionValue.length <= 2000) {
                          setLocationDescription(event.target.value);
                        }
                      }}
                    />
                    {locationDescriptionValidationErrMsg && (
                      <FormHelperText id="input-locationDescription-error">{locationDescriptionValidationErrMsg}</FormHelperText>
                    )}
                  </FormControl>

                  <Grid container sx={{
                    justifyContent: "space-between"
                  }}>
                    <Button onClick={handleOnSubmit} variant="contained">Submit</Button>
                    <Button onClick={reinitializeAllOfForm} variant="outlined">Cancel</Button>
                  </Grid>
                </>
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default EditLocation;
