import { Backdrop, Box, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useParams } from "react-router";
import { useAppDispatch, useAppSelector, type RootState } from "../../../app/store";
import { clearGetSelectedUserResults, getSelectedUserAction } from "../adminDashboardSlice";
import { REDUX_ACTION_STATUS } from "../../../constants/globalConstants";

function EditUserRoles() {
  const dispatch = useAppDispatch();
  const { selectedUser, getSelectedUserRequestStatus } = useAppSelector((state: RootState) => state.adminDashboard);
  const { userUuid } = useParams();

  useEffect(() => {
    const getSelectedUserFunc = async () => {
      if (userUuid !== undefined && userUuid !== null) {
        await dispatch(getSelectedUserAction(userUuid));
      } else {
        throw new Error("Variable userUuid was null/undefined when EditUserRoles useEffect triggered");
      }
    };

    getSelectedUserFunc();

    return () => {
      dispatch(clearGetSelectedUserResults());
    };
  }, [userUuid]);

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={getSelectedUserRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
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
          <Box>
            <Stack spacing={2} sx={{
              marginTop: 2
            }}>
              <Typography variant="h5" component="div">
                Edit User Roles
              </Typography>

              {selectedUser !== null && (
                <>
                  <Box>
                    <Typography variant="body1" component="div">
                      Username: {selectedUser.username}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" component="div">
                      Email: {selectedUser.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" component="div">
                      Roles: {selectedUser.roles.join('; ')}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </>
  )
}

export default EditUserRoles;
