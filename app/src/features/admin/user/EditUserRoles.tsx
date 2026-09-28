import { Alert, Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, Typography, type SelectChangeEvent } from "@mui/material";
import { useEffect, useState, type SubmitEvent } from "react";
import { useParams } from "react-router";
import type { SerializedError } from "@reduxjs/toolkit";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector, type RootState } from "../../../app/store";
import { addRoleToSelectedUserAction, clearGetSelectedUserResults, getSelectedUserAction } from "../adminDashboardSlice";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../../constants/globalConstants";
import { UserRoleNoMemberOrUser } from "../../../constants/userConstants";
import type { AddRoleToUserRequest } from "../../../api/userAPI";

function EditUserRoles() {
  const dispatch = useAppDispatch();
  const { selectedUser, getSelectedUserRequestStatus } = useAppSelector((state: RootState) => state.adminDashboard);
  const { userUuid } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<UserRoleNoMemberOrUser | null>(null);
  const [numOfAvailableRoles, setNumOfAvailableRoles] = useState(0);
  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");
  const [roleToAddValidationError, setRoleToAddValidationError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      dispatch(clearGetSelectedUserResults());
    };
  }, [])

  useEffect(() => {
    const getSelectedUserFunc = async () => {
      if (userUuid !== undefined && userUuid !== null) {
        await dispatch(getSelectedUserAction(userUuid));
      } else {
        throw new Error("Variable userUuid was null/undefined when EditUserRoles useEffect triggered");
      }
    };

    getSelectedUserFunc();
  }, [userUuid]);

  useEffect(() => {
    if (roleToAdd === null) {
      const numOfAvailableRolesLocal = getAvailableRoles().length;
      setNumOfAvailableRoles(numOfAvailableRolesLocal);
    }
  }, [selectedUser, roleToAdd]);

  const handleAddRoleOpenModal = () => {
    setIsAddRoleModalOpen(true);
  };

  const handleAddRoleCloseModal = () => {
    reinitializeAllOfForm();
    setIsAddRoleModalOpen(false);
  }

  const handleRemoveRoleOpenModal = () => {

  };

  const reinitializeAllOfForm = () => {
    reintializeErrors();
    reinitializeFormValues();
  }

  const reintializeErrors = () => {
    setIsServerError(false);
    setServerErrorMsg("");
  }

  const reinitializeFormValues = () => {
    setRoleToAdd(null);

    setRoleToAddValidationError(null);
  }

  const handleSubmitAddRoleForm = async (event: SubmitEvent) => {
    event.preventDefault();

    if (userUuid === null || userUuid === undefined) {
      throw new Error(`Value of userUuid is null/undefined when handleSubmitAddRoleForm is invoked: ${userUuid}`);
    }

    setIsServerError(false);
    setServerErrorMsg("");

    let isFrontendError = false;

    if (roleToAdd && roleToAdd.length <= 0) {
      setRoleToAddValidationError("Role To Add is required");
      isFrontendError = true;
    }

    if (isFrontendError) {
      return;
    }

    const data: AddRoleToUserRequest = {
      userUuid,
      role: roleToAdd as UserRoleNoMemberOrUser
    };
    
    try {
      await dispatch(addRoleToSelectedUserAction(data)).unwrap();

      reinitializeFormValues();
      enqueueSnackbar("Role added to user successfully", { variant: "success" });
      handleAddRoleCloseModal();
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
  }

  const handleChangeAddRoleSelection = (event: SelectChangeEvent<UserRoleNoMemberOrUser>) => {
    setRoleToAdd(event.target.value);
  }

  const getAvailableRoles = () => {
    if (selectedUser !== null) {
      const userRoleToAddOptions = Object.values(UserRoleNoMemberOrUser).filter(role => !selectedUser.roles.includes(role));
      return userRoleToAddOptions.map(role => {
        return role;
      });
    } else {
      return [];
    }
  };

  return (
    <>
      {selectedUser !== null && (
        <Dialog open={isAddRoleModalOpen} onClose={handleAddRoleCloseModal} closeAfterTransition={false}>
          <DialogTitle>Add User Role</DialogTitle>
          <DialogContent>
            {isServerError && (
              <Alert sx={{ marginBottom: 1 }} color="error">{serverErrorMsg}</Alert>
            )}
            <DialogContentText>
              Select the role to add for this user
            </DialogContentText>
            <Box component="form" onSubmit={handleSubmitAddRoleForm} id="addRole-form" sx={{ marginTop: 1 }}>
              <FormControl fullWidth error={roleToAddValidationError !== null} size="small">
                <InputLabel id="addRole-form-roles-label">Role To Add</InputLabel>
                <Select
                  labelId="addRole-form-roles-label"
                  id="addRole-form-roles-select"
                  value={roleToAdd !== null && !selectedUser.roles.includes(roleToAdd) ? roleToAdd : ''}
                  label="Role To Add"
                  onChange={handleChangeAddRoleSelection}
                >
                  {Object.values(UserRoleNoMemberOrUser).filter(role => !selectedUser.roles.includes(role))
                    .map(role => (
                      <MenuItem key={`${role}-select-option`} value={role}>{role}</MenuItem>
                    ))
                  }
                </Select>
                {roleToAddValidationError !== null && (
                  <FormHelperText id="addRole-form-roles-error">{roleToAddValidationError}</FormHelperText>
                )}
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleAddRoleCloseModal}>Cancel</Button>
            <Button disabled={roleToAdd !== null && roleToAdd.length <= 0} variant="contained" type="submit" form="addRole-form">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
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

                  <Grid container sx={{
                    justifyContent: "space-between"
                  }}>
                    <Button disabled={numOfAvailableRoles === 0} onClick={handleAddRoleOpenModal} variant="contained">Add Role</Button>
                    <Button disabled={numOfAvailableRoles === Object.values(UserRoleNoMemberOrUser).length} color="error" onClick={handleRemoveRoleOpenModal} variant="contained">Remove Role</Button>
                  </Grid>
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
