import { Alert, Backdrop, Box, CircularProgress, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import { logoutAction } from "../login/loginSlice";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";

function Logout() {
  const dispatch = useAppDispatch();

  const { logoutRequestStatus } = useAppSelector((state: RootState) => state.login);

  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  useEffect(() => {
    const logoutFunc = async () => {
      try {
        await dispatch(logoutAction());
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

    logoutFunc();
  }, []);

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={logoutRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
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
          {isServerError && (
            <Box>
              <Alert severity="error">{serverErrorMsg}</Alert>
            </Box>
          )}

          {logoutRequestStatus === REDUX_ACTION_STATUS.SUCCESS_STATUS && (
            <Box>
              You have logged out successfully
            </Box>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default Logout;
