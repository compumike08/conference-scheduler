import { Backdrop, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography, type SelectChangeEvent } from "@mui/material";
import { useEffect, useState, type SubmitEvent } from "react";
import { useParams } from "react-router";
import { useAppDispatch, useAppSelector, type RootState } from "../../../app/store";
import { clearGetSelectedUserResults, getSelectedUserAction } from "../adminDashboardSlice";
import { REDUX_ACTION_STATUS } from "../../../constants/globalConstants";
import { UserRole } from "../../../constants/userConstants";

function EditUserRoles() {
  const dispatch = useAppDispatch();
  const { selectedUser, getSelectedUserRequestStatus } = useAppSelector((state: RootState) => state.adminDashboard);
  const { userUuid } = useParams();

  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState("");
  const [numOfAvailableRoles, setNumOfAvailableRoles] = useState(0);

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
    const numOfAvailableRolesLocal = generateAddRoleModalSelectOptions().length;
    setNumOfAvailableRoles(numOfAvailableRolesLocal);
  }, [selectedUser]);

  const handleAddRoleOpenModal = () => {
    setIsAddRoleModalOpen(true);
  };

  const handleAddRoleCloseModal = () => {
    setRoleToAdd("");
    setIsAddRoleModalOpen(false);
  }

  const handleRemoveRoleOpenModal = () => {

  };

  const handleSubmitAddRoleForm = async (event: SubmitEvent) => {
    event.preventDefault();
    console.log(roleToAdd);
    handleAddRoleCloseModal();
  }

  const handleChangeAddRoleSelection = (event: SelectChangeEvent) => {
    setRoleToAdd(event.target.value);
  }

  const generateAddRoleModalSelectOptions = () => {
    if (selectedUser !== null) {
      const userRoleToAddOptions = Object.values(UserRole).filter(role => !selectedUser.roles.includes(role));
      return userRoleToAddOptions.map(role => (
        <MenuItem key={`${role}-select-option`} value={role}>{role}</MenuItem>
      ));
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
            <DialogContentText>
              Select the role to add for this user
            </DialogContentText>
            <Box component="form" onSubmit={handleSubmitAddRoleForm} id="addRole-form">
              <FormControl fullWidth>
                <InputLabel id="addRole-form-roles-label">Role To Add</InputLabel>
                <Select
                  labelId="addRole-form-roles-label"
                  id="addRole-form-roles-select"
                  value={roleToAdd}
                  label="Role To Add"
                  onChange={handleChangeAddRoleSelection}
                >
                  {generateAddRoleModalSelectOptions()}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleAddRoleCloseModal}>Cancel</Button>
            <Button variant="contained" type="submit" form="addRole-form">
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
                    <Button disabled={numOfAvailableRoles > 0} color="error" onClick={handleRemoveRoleOpenModal} variant="contained">Remove Role</Button>
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
