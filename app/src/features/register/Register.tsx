import { Box, Button, FormControl, Grid, Input, InputLabel, Stack, Alert, Backdrop, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import type { NewUserRequest } from "../../api/registerAPI";
import { registerUserAction } from "./registerSlice";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import type { SerializedError } from "@reduxjs/toolkit";

function Register() {
  const { username: savedNewUsername, registerUserRequestStatus } = useAppSelector((state: RootState) => state.registerUser);
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");
  const [isRegisterUserSuccess, setIsRegisterUserSuccess] = useState(false);

  const reinitializeAllOfForm = () => {
    setIsRegisterUserSuccess(false);
    setIsServerError(false);
    setServerErrorMsg("");
    setIsRegisterUserSuccess(false);

    reinitializeFormValues();
  };

  const reinitializeFormValues = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
  };

  const handleOnSubmit = async () => {
    const data: NewUserRequest = {
      username,
      email,
      password
    };

    try {
      setIsRegisterUserSuccess(false);
      setIsServerError(false);
      setServerErrorMsg("");

      await dispatch(registerUserAction(data)).unwrap();

      setIsRegisterUserSuccess(true);
      reinitializeFormValues();
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
        open={registerUserRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
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
              {isServerError && (
                <Box>
                  <Alert severity="error">{serverErrorMsg}</Alert>
                </Box>
              )}

              {isRegisterUserSuccess && (
                <Alert severity="success">Registered new user '{savedNewUsername}' successfully</Alert>
              )}

              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="input-username">Username</InputLabel>
                <Input
                  id="input-username"
                  value={username}
                  onChange={(event) => {
                    const usernameValue = event.target.value;

                    if (usernameValue.length <= 50) {
                      setUsername(event.target.value);
                    }
                  }}
                />
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="input-email">Email</InputLabel>
                <Input
                  id="input-email"
                  value={email}
                  onChange={(event) => {
                    const emailValue = event.target.value;

                    if (emailValue.length <= 100) {
                      setEmail(event.target.value);
                    }
                  }}
                />
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="input-password">Password</InputLabel>
                <Input
                  type="password"
                  id="input-password"
                  value={password}
                  onChange={(event) => {
                    const passwordValue = event.target.value;

                    if (passwordValue.length <= 50) {
                      setPassword(event.target.value);
                    }
                  }}
                />
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="input-password-confirm">Confirm Password</InputLabel>
                <Input
                  type="password"
                  id="input-password-confirm"
                  value={passwordConfirm}
                  onChange={(event) => {
                    const passwordConfirmValue = event.target.value;

                    if (passwordConfirmValue.length <= 50) {
                      setPasswordConfirm(event.target.value);
                    }
                  }}
                />
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

export default Register;
