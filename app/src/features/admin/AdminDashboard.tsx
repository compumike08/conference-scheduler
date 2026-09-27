import { useEffect, useState } from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import { useNavigate } from "react-router";
import { Alert, Box, Button, FormControl, FormHelperText, Grid, Input, InputLabel, Stack, Typography } from "@mui/material";
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import { clearSearchByUsernameResults, searchByUsernameAction } from "./adminDashboardSlice";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import type { UserRequestResponse } from "../../api/userAPI";
import { selectMatchingUsersListWithId } from "./adminDashboardSelectors";

function AdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      reinitializeAllOfForm();
    };
  }, []);

  const matchingUsersList = useAppSelector((state: RootState) => selectMatchingUsersListWithId(state));
  const { searchByUsernameRequestStatus } = useAppSelector((state: RootState) => state.adminDashboard);

  const [username, setUsername] = useState("");
  const [usernameValidationErrMsg, setUsernameValidationErrMsg] = useState<string | null>(null);

  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  const reinitializeAllOfForm = () => {
    reinitializeErrors();
    reinitializeFormValues();

    dispatch(clearSearchByUsernameResults());
  };

  const reinitializeErrors = () => {
    setIsServerError(false);
    setServerErrorMsg("");
  };

  const reinitializeFormValues = () => {
    setUsername("");

    setUsernameValidationErrMsg(null);
  };

  const handleOnSearch = async () => {
    reinitializeErrors();

    let isFrontendInvalid = false;

    if (username.length < 1 || username.length > 50) {
      setUsernameValidationErrMsg("Username must be between 1 and 50 characters long");
      isFrontendInvalid = true;
    }

    if (isFrontendInvalid) {
      return;
    }

    try {
      await dispatch(searchByUsernameAction(username)).unwrap();
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

  const columns: GridColDef<Array<UserRequestResponse>[number]>[] = [
    {
      field: 'username',
      headerName: 'Username',
      width: 150,
      editable: false,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 150,
      editable: false,
    },
    {
      field: 'rolesString',
      headerName: 'Roles',
      editable: false,
      rowHeader: true,
      sortable: false,
      width: 550,
      valueGetter: (_value, row) => row.roles.join("; ")
    }
  ];

  const handleRowClick = (params: GridRowParams<UserRequestResponse & { id: string }>) => {
    navigate(`/admin/user/${params.id}`);
  };

  return (
    <Grid container sx={{
      justifyContent: "center"
    }}>
      <Grid size={{
        xs: 12
      }}>
        <Box>
          <Stack spacing={2} sx={{
            marginTop: 2
          }}>
            <Typography variant="h5" component="div">
              Admin Dashboard
            </Typography>

            <Box component="form">
              <Typography variant="h6" component="div">
                Search For Usernames
              </Typography>

              {isServerError && (
                <Box>
                  <Alert severity="error">
                    {serverErrorMsg}
                  </Alert>
                </Box>
              )}

              <Grid size={{
                xs: 12,
                sm: 12,
                md: 8,
                lg: 6
              }}>
                <FormControl error={usernameValidationErrMsg !== null} variant="standard" fullWidth required>
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
              </Grid>

              <Grid sx={{
                marginTop: 1
              }}>
                <Button sx={{ marginRight: 1 }} onClick={handleOnSearch} variant="contained">Search</Button>
                <Button onClick={reinitializeAllOfForm} variant="outlined">Cancel</Button>
              </Grid>
            </Box>

            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                loading={searchByUsernameRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS}
                rows={matchingUsersList}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 5,
                    },
                  },
                }}
                pageSizeOptions={[5]}
                onRowClick={handleRowClick}
              />
            </Box>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  )
}

export default AdminDashboard;
