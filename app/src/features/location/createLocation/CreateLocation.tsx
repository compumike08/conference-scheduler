import { Backdrop, CircularProgress, Grid, Box, Stack, Typography, Alert, FormControl, InputLabel, Input, FormHelperText, Button } from "@mui/material";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import type { SerializedError } from "@reduxjs/toolkit";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../../constants/globalConstants";
import NumberSpinner from "../../../shared/NumberSpinner";
import { useAppDispatch, useAppSelector, type RootState } from "../../../app/store";
import type { CreateLocationRequest } from "../../../api/locationAPI";
import { createNewLocationAction } from "../locationSlice";


function CreateLocation() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { createLocationRequestStatus } = useAppSelector((state: RootState) => state.location);

  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  const [locationName, setLocationName] = useState("");
  const [locationNameValidationErrMsg, setLocationNameValidationErrMsg] = useState<string | null>(null);

  const [capacity, setCapacity] = useState(1);
  const [capacityValidationErrMsg, setCapacityValidationErrMsg] = useState<string | null>(null);

  const [locationDescription, setLocationDescription] = useState("");
  const [locationDescriptionValidationErrMsg, setLocationDescriptionValidationErrMsg] = useState<string | null>(null);

  const handleCapacityChange = (value: number | null) => {
    setCapacity(value || 1);
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
    setLocationName("");
    setCapacity(1);
    setLocationDescription("");

    setLocationNameValidationErrMsg(null);
    setCapacityValidationErrMsg(null);
    setLocationDescriptionValidationErrMsg(null);
  };

  const handleOnSubmit = async () => {
    reintializeErrors();

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

    const data: CreateLocationRequest = {
      locationName,
      capacity,
      locationDescription
    };

    try {
      await dispatch(createNewLocationAction(data)).unwrap();

      reinitializeFormValues();
      
      enqueueSnackbar(`New location created successfully`, { variant: "success" });

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
        open={createLocationRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
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
                Create Location
              </Typography>
              
              {isServerError && (
                <Box>
                  <Alert severity="error">{serverErrorMsg}</Alert>
                </Box>
              )}

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
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default CreateLocation;
