import { useState } from "react";
import { Alert, Backdrop, Box, Button, CircularProgress, FormControl, FormHelperText, Grid, Input, InputLabel, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import type { SerializedError } from "@reduxjs/toolkit";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import type { NewMemberRequest } from "../../api/memberAPI";
import { createMemberAndReturnUpdatedUserAction } from "./memberSlice";

function Member() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  
  const { createMemberAndReturnUpdatedUserRequestStatus } = useAppSelector((state: RootState) => state.member);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  const [firstNameValidationErrMsg, setFirstNameValidationErrMsg] = useState<string | null>(null);
  const [lastNameValidationErrMsg, setLastNameValidationErrMsg] = useState<string | null>(null);

  const reinitializeAllOfForm = () => {
    reintializeErrors();
    reinitializeFormValues();
  };

  const reintializeErrors = () => {
    setIsServerError(false);
    setServerErrorMsg("");
  };

  const reinitializeFormValues = () => {
    setFirstName("");
    setLastName("");

    setFirstNameValidationErrMsg(null);
    setLastNameValidationErrMsg(null);
  };

  const handleOnSubmit = async () => {
    reintializeErrors();

    let isFrontendInvalid = false;

    if (firstName.length < 1 || firstName.length > 100) {
      setFirstNameValidationErrMsg("First name must be between 1 and 100 characters long");
      isFrontendInvalid = true;
    }

    if (lastName.length < 1 || lastName.length > 100) {
      setLastNameValidationErrMsg("Last name must be between 1 and 100 characters long");
      isFrontendInvalid = true;
    }

    if (isFrontendInvalid) {
      return;
    }

    const data: NewMemberRequest = {
      firstName,
      lastName
    };

    try {
      await dispatch(createMemberAndReturnUpdatedUserAction(data)).unwrap();

      reinitializeFormValues();
      
      enqueueSnackbar(`New member created successfully`, { variant: "success" });

      // TODO: Redirect to '/about' for now; update later
      navigate("/about");
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
        open={createMemberAndReturnUpdatedUserRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
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
                Create Member Profile
              </Typography>
              
              {isServerError && (
                <Box>
                  <Alert severity="error">{serverErrorMsg}</Alert>
                </Box>
              )}

              <FormControl error={firstNameValidationErrMsg !== null} variant="standard" fullWidth>
                <InputLabel htmlFor="input-firstName">First Name</InputLabel>
                <Input
                  id="input-firstName"
                  value={firstName}
                  onChange={(event) => {
                    const firstNameValue = event.target.value;

                    if (firstNameValue.length <= 100) {
                      setFirstName(event.target.value);
                    }
                  }}
                />
                {firstNameValidationErrMsg && (
                  <FormHelperText id="input-firstName-error">{firstNameValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl error={lastNameValidationErrMsg !== null} variant="standard" fullWidth>
                <InputLabel htmlFor="input-lastName">Last Name</InputLabel>
                <Input
                  id="input-lastName"
                  value={lastName}
                  onChange={(event) => {
                    const lastNameValue = event.target.value;

                    if (lastNameValue.length <= 100) {
                      setLastName(event.target.value);
                    }
                  }}
                />
                {lastNameValidationErrMsg && (
                  <FormHelperText id="input-lastName-error">{lastNameValidationErrMsg}</FormHelperText>
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
  )
}

export default Member;
