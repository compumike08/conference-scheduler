import { Backdrop, Box, CircularProgress, Grid } from "@mui/material";
import { useEffect } from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import { logoutAction } from "../login/loginSlice";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";

function Logout() {
  const dispatch = useAppDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { logoutRequestStatus } = useAppSelector((state: RootState) => state.login);

  useEffect(() => {
    const logoutFunc = async () => {
      try {
        await dispatch(logoutAction()).unwrap();
      } catch (err) {
        const error = err as SerializedError;
        if (error.message && error.message.length > 0) {
          enqueueSnackbar(error.message, { variant: "error", preventDuplicate: true });
        } else {
          console.log(error);
          enqueueSnackbar(UNKNOWN_ERR_MSG, { variant: "error", preventDuplicate: true });
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
