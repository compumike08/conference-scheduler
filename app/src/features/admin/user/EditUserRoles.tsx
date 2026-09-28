import { Alert, Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, Typography, type SelectChangeEvent } from "@mui/material";
import { useEffect, useState, type SubmitEvent } from "react";
import { useParams } from "react-router";
import type { SerializedError } from "@reduxjs/toolkit";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector, type RootState } from "../../../app/store";
import { addRoleToSelectedUserAction, clearGetSelectedUserResults, getSelectedUserAction, removeRoleFromSelectedUserAction } from "../adminDashboardSlice";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../../constants/globalConstants";
import { UserRoleNoMemberOrUser } from "../../../constants/userConstants";
import type { EditRoleForUserRequest } from "../../../api/userAPI";

function EditUserRoles() {
  const dispatch = useAppDispatch();
  const { selectedUser, getSelectedUserRequestStatus } = useAppSelector((state: RootState) => state.adminDashboard);
  const { userUuid } = useParams();

  const { enqueueSnackbar } = useSnackbar();

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isRemoveRoleModalOpen, setIsRemoveRoleModalOpen] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<UserRoleNoMemberOrUser | null>(null);
  const [roleToRemove, setRoleToRemove] = useState<UserRoleNoMemberOrUser | null>(null);
  const [numOfAvailableRolesToAdd, setNumOfAvailableRolesToAdd] = useState(0);
  const [numOfAvailableRolesToRemove, setNumOfAvailableRolesToRemove] = useState(0);
  const [isServerErrorAddRole, setIsServerErrorAddRole] = useState(false);
  const [serverErrorMsgAddRole, setServerErrorMsgAddRole] = useState("");
  const [isServerErrorRemoveRole, setIsServerErrorRemoveRole] = useState(false);
  const [serverErrorMsgRemoveRole, setServerErrorMsgRemoveRole] = useState("");
  const [roleToAddValidationError, setRoleToAddValidationError] = useState<string | null>(null);
  const [roleToRemoveValidationError, setRoleToRemoveValidationError] = useState<string | null>(null);

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
      const numOfAvailableRolesToAddLocal = getAvailableRolesToAdd().length;
      setNumOfAvailableRolesToAdd(numOfAvailableRolesToAddLocal);
    }
  }, [selectedUser, roleToAdd]);

  useEffect(() => {
    if (roleToRemove === null) {
      const numOfAvailableRolesToRemoveLocal = getAvailableRolesToRemove().length;
      setNumOfAvailableRolesToRemove(numOfAvailableRolesToRemoveLocal);
    }
  }, [selectedUser, roleToRemove]);

  const handleAddRoleOpenModal = () => {
    setIsAddRoleModalOpen(true);
  };

  const handleAddRoleCloseModal = () => {
    reinitializeAllOfAddRoleForm();
    setIsAddRoleModalOpen(false);
  }

  const handleRemoveRoleCloseModal = () => {
    reinitializeAllOfRemoveRoleForm();
    setIsRemoveRoleModalOpen(false);
  };

  const handleRemoveRoleOpenModal = () => {
    setIsRemoveRoleModalOpen(true);
  };

  const reinitializeAllOfRemoveRoleForm = () => {
    reintializeErrorsRemoveRoleForm();
    reinitializeRemoveFormValues();
  };

  const reinitializeAllOfAddRoleForm = () => {
    reintializeErrorsAddRoleForm();
    reinitializeAddFormValues();
  };

  const reintializeErrorsAddRoleForm = () => {
    setIsServerErrorAddRole(false);
    setServerErrorMsgAddRole("");
  };

  const reinitializeAddFormValues = () => {
    setRoleToAdd(null);

    setRoleToAddValidationError(null);
  };

  const reintializeErrorsRemoveRoleForm = () => {
    setIsServerErrorRemoveRole(false);
    setServerErrorMsgRemoveRole("");
  };

  const reinitializeRemoveFormValues = () => {
    setRoleToRemove(null);

    setRoleToRemoveValidationError(null);
  };

  const handleSubmitAddRoleForm = async (event: SubmitEvent) => {
    event.preventDefault();

    if (userUuid === null || userUuid === undefined) {
      throw new Error(`Value of userUuid is null/undefined when handleSubmitAddRoleForm is invoked: ${userUuid}`);
    }

    setIsServerErrorAddRole(false);
    setServerErrorMsgAddRole("");

    let isFrontendError = false;

    if (!roleToAdd) {
      setRoleToAddValidationError("Role To Add is required");
      isFrontendError = true;
    }

    if (isFrontendError) {
      return;
    }

    const data: EditRoleForUserRequest = {
      userUuid,
      role: roleToAdd as UserRoleNoMemberOrUser
    };
    
    try {
      await dispatch(addRoleToSelectedUserAction(data)).unwrap();

      reinitializeAddFormValues();
      enqueueSnackbar("Role added to user successfully", { variant: "success" });
      handleAddRoleCloseModal();
    } catch (err) {
      const error = err as SerializedError;
      setIsServerErrorAddRole(true);

      if (error.message && error.message.length > 0) {
        setServerErrorMsgAddRole(error.message);
      } else {
        console.log(error);
        setServerErrorMsgAddRole(UNKNOWN_ERR_MSG);
      }
    }
  }

  const handleSubmitRemoveRoleForm = async (event: SubmitEvent) => {
    event.preventDefault();

    if (userUuid === null || userUuid === undefined) {
      throw new Error(`Value of userUuid is null/undefined when handleSubmitRemoveRoleForm is invoked: ${userUuid}`);
    }

    setIsServerErrorRemoveRole(false);
    setServerErrorMsgRemoveRole("");

    let isFrontendError = false;

    if (!roleToRemove) {
      setRoleToRemoveValidationError("Role To Remove is required");
      isFrontendError = true;
    }

    if (isFrontendError) {
      return;
    }

    const data: EditRoleForUserRequest = {
      userUuid,
      role: roleToRemove as UserRoleNoMemberOrUser
    };
    
    try {
      await dispatch(removeRoleFromSelectedUserAction(data)).unwrap();

      reinitializeRemoveFormValues();
      enqueueSnackbar("Role removed from user successfully", { variant: "success" });
      handleRemoveRoleCloseModal();
    } catch (err) {
      const error = err as SerializedError;
      setIsServerErrorRemoveRole(true);

      if (error.message && error.message.length > 0) {
        setServerErrorMsgRemoveRole(error.message);
      } else {
        console.log(error);
        setServerErrorMsgRemoveRole(UNKNOWN_ERR_MSG);
      }
    }
  };

  const handleChangeAddRoleSelection = (event: SelectChangeEvent<UserRoleNoMemberOrUser>) => {
    setRoleToAdd(event.target.value);
  }

  const handleChangeRemoveRoleSelection = (event: SelectChangeEvent<UserRoleNoMemberOrUser>) => {
    setRoleToRemove(event.target.value);
  }

  const getAvailableRolesToAdd = () => {
    if (selectedUser !== null) {
      const userRoleToAddOptions = Object.values(UserRoleNoMemberOrUser).filter(role => !selectedUser.roles.includes(role));
      return userRoleToAddOptions.map(role => {
        return role;
      });
    } else {
      return [];
    }
  };

  const getAvailableRolesToRemove = () => {
    if (selectedUser !== null) {
      const userRoleToRemoveOptions = Object.values(UserRoleNoMemberOrUser).filter(role => selectedUser.roles.includes(role));
      return userRoleToRemoveOptions.map(role => {
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
            {isServerErrorAddRole && (
              <Alert sx={{ marginBottom: 1 }} color="error">{serverErrorMsgAddRole}</Alert>
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
                      <MenuItem key={`${role}-add-select-option`} value={role}>{role}</MenuItem>
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
            <Button disabled={roleToAdd === null} variant="contained" type="submit" form="addRole-form">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {selectedUser !== null && (
        <Dialog open={isRemoveRoleModalOpen} onClose={handleRemoveRoleCloseModal} closeAfterTransition={false}>
          <DialogTitle>Remove User Role</DialogTitle>
          <DialogContent>
            {isServerErrorRemoveRole && (
              <Alert sx={{ marginBottom: 1 }} color="error">{serverErrorMsgRemoveRole}</Alert>
            )}
            <DialogContentText>
              Select the role to remove for this user
            </DialogContentText>
            <Box component="form" onSubmit={handleSubmitRemoveRoleForm} id="removeRole-form" sx={{ marginTop: 1 }}>
              <FormControl fullWidth error={roleToRemoveValidationError !== null} size="small">
                <InputLabel id="removeRole-form-roles-label">Role To Remove</InputLabel>
                <Select
                  labelId="removeRole-form-roles-label"
                  id="removeRole-form-roles-select"
                  value={roleToRemove !== null && selectedUser.roles.includes(roleToRemove) ? roleToRemove : ''}
                  label="Role To Remove"
                  onChange={handleChangeRemoveRoleSelection}
                >
                  {Object.values(UserRoleNoMemberOrUser).filter(role => selectedUser.roles.includes(role))
                    .map(role => (
                      <MenuItem key={`${role}-remove-select-option`} value={role}>{role}</MenuItem>
                    ))
                  }
                </Select>
                {roleToRemoveValidationError !== null && (
                  <FormHelperText id="removeRole-form-roles-error">{roleToRemoveValidationError}</FormHelperText>
                )}
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleRemoveRoleCloseModal}>Cancel</Button>
            <Button disabled={roleToRemove === null} variant="contained" type="submit" form="removeRole-form">
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
                    <Button disabled={numOfAvailableRolesToAdd === 0} onClick={handleAddRoleOpenModal} variant="contained">Add Role</Button>
                    <Button disabled={numOfAvailableRolesToRemove === 0} color="error" onClick={handleRemoveRoleOpenModal} variant="contained">Remove Role</Button>
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
