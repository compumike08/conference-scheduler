import { Box, Button, FormControl, Grid, Input, InputLabel, Stack, Alert, Backdrop, CircularProgress, FormHelperText, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import type { LoginRequest } from "../../api/authAPI";
import { authenticateAction } from "./loginSlice";
import { getCurrentUserAction } from "../user/userSlice";
import { UserRole } from "../../constants/userConstants";

function Login() {
  const { authenticateRequestStatus } = useAppSelector((state: RootState) => state.login);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  const [usernameValidationErrMsg, setUsernameValidationErrMsg] = useState<string | null>(null);
  const [passwordValidationErrMsg, setPasswordValidationErrMsg] = useState<string | null>(null);

  const [isRedirectToCreateMemberAlertOpen, setIsRedirectToCreateMemberAlertOpen] = useState(false);

  const reinitializeAllOfForm = () => {
    reintializeErrors();
    reinitializeFormValues();
  };

  const reintializeErrors = () => {
    setIsServerError(false);
    setServerErrorMsg("");

    setUsernameValidationErrMsg(null);
    setPasswordValidationErrMsg(null);
  };

  const reinitializeFormValues = () => {
    setUsername("");
    setPassword("");
  };

  const handleOnSubmit = async () => {
    reintializeErrors();

    let isFrontendInvalid = false;

    if (username.length < 2 || username.length > 50) {
      setUsernameValidationErrMsg("Username must be between 2 and 50 characters long");
      isFrontendInvalid = true;
    }

    if (password.length < 8 || password.length > 50) {
      setPasswordValidationErrMsg("Password must be between 8 and 50 characters long");
      isFrontendInvalid = true;
    }

    if (isFrontendInvalid) {
      return;
    }

    const data: LoginRequest = {
      username,
      password
    };

    try {
      await dispatch(authenticateAction(data)).unwrap();
      const currentUser = await dispatch(getCurrentUserAction()).unwrap();

      enqueueSnackbar("Logged in successfully", { variant: "success" });

      if (!currentUser.roles.includes(UserRole.ROLE_MEMBER)) {
        setIsRedirectToCreateMemberAlertOpen(true);
      } else {
        // TODO: Redirect to '/about' for now; update later
        navigate("/about");
      }
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

  const handleDialogNo = () => {
    setIsRedirectToCreateMemberAlertOpen(false);

    // TODO: Redirect to '/about' for now; update later
    navigate("/about");
  };

  const handleDialogYes = () => {
    setIsRedirectToCreateMemberAlertOpen(false);

    navigate("/member");
  };

  return (
    <>
      <Dialog
        open={isRedirectToCreateMemberAlertOpen}
        onClose={handleDialogNo}
        aria-labelledby="alert-dialog-redirect-to-create-member--title"
        aria-describedby="alert-dialog-redirect-to-create-member--description"
        role="alertdialog"
        closeAfterTransition={false}
      >
        <DialogTitle id="alert-dialog-redirect-to-create-member--title">
          {"Do you want to create a member profile?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-redirect-to-create-member--description">
            You are not currently a member. Do you want to create a member profile now?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogNo} autoFocus>
            No
          </Button>
          <Button onClick={handleDialogYes}>Yes</Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={authenticateRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
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

export default Login;
