import { Box, Button, FormControl, Grid, Input, InputLabel, Stack, Alert, Backdrop, CircularProgress, FormHelperText } from "@mui/material";
import { useState } from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import type { NewUserRequest } from "../../api/registerAPI";
import { registerUserAction } from "./registerSlice";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import { EMAIL_VALIDATION_REGEX } from "../../constants/userConstants";

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

  const [usernameValidationErrMsg, setUsernameValidationErrMsg] = useState<string | null>(null);
  const [emailValidationErrMsg, setEmailValidationErrMsg] = useState<string | null>(null);
  const [passwordValidationErrMsg, setPasswordValidationErrMsg] = useState<string | null>(null);
  const [confirmPasswordValidationErrMsg, setConfirmPasswordValidationErrMsg] = useState<string | null>(null);

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

    setUsernameValidationErrMsg(null);
    setEmailValidationErrMsg(null);
    setPasswordValidationErrMsg(null);
    setConfirmPasswordValidationErrMsg(null);
  };

  const handleOnSubmit = async () => {
    setIsRegisterUserSuccess(false);
    setIsServerError(false);
    setServerErrorMsg("");

    let isFrontendInvalid = false;

    if (username.length < 2 || username.length > 50) {
      setUsernameValidationErrMsg("Username must be between 2 and 50 characters long");
      isFrontendInvalid = true;
    }

    if (email.length < 2 || email.length > 100) {
      setEmailValidationErrMsg("Email must be between 2 and 100 characters long");
      isFrontendInvalid = true;
    } else if (!EMAIL_VALIDATION_REGEX.test(email)) {
      setEmailValidationErrMsg("Email is not a valid email address");
      isFrontendInvalid = true;
    }

    if (password.length < 2 || password.length > 50) {
      setPasswordValidationErrMsg("Username must be between 2 and 50 characters long");
      isFrontendInvalid = true;
    }

    if (password !== passwordConfirm) {
      setConfirmPasswordValidationErrMsg("Password and Confirm Password fields must match");
      isFrontendInvalid = true;
    }

    if (isFrontendInvalid) {
      return;
    }

    const data: NewUserRequest = {
      username,
      email,
      password
    };

    try {
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

              <FormControl error={usernameValidationErrMsg !== null} variant="standard" fullWidth>
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
                {usernameValidationErrMsg && (
                  <FormHelperText id="input-username-error">{usernameValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl error={emailValidationErrMsg !== null} variant="standard" fullWidth>
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
                {emailValidationErrMsg && (
                  <FormHelperText id="input-email-error">{emailValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl error={passwordValidationErrMsg !== null} variant="standard" fullWidth>
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
                {passwordValidationErrMsg && (
                  <FormHelperText id="input-password-error">{passwordValidationErrMsg}</FormHelperText>
                )}
              </FormControl>

              <FormControl error={confirmPasswordValidationErrMsg !== null} variant="standard" fullWidth>
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
                {confirmPasswordValidationErrMsg && (
                  <FormHelperText id="input-password-confirm-error">{confirmPasswordValidationErrMsg}</FormHelperText>
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

export default Register;
