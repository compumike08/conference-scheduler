import { useEffect, useState } from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import { useNavigate } from "react-router";
import { Alert, Backdrop, Box, Button, CircularProgress, FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, Input, InputLabel, MenuItem, Radio, RadioGroup, Select, Stack, Typography, type SelectChangeEvent } from "@mui/material";
import { DataGrid, type GridColDef, type GridFilterModel, type GridRowParams, type GridSortModel } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import { clearSearchForUsersResults, searchByUsernameAction, searchByUserRoleAction } from "./adminDashboardSlice";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import type { UserRequestResponse } from "../../api/userAPI";
import { selectMatchingUsersListWithId } from "./adminDashboardSelectors";
import { UsersSearchTypeOptions, type UsersSearchTypeOptionCode } from "./adminDashboardConstants";
import { UserRole } from "../../constants/userConstants";

const INITIAL_FILTER_MODEL: GridFilterModel = {
  items: [],
  quickFilterValues: [], // Reset quick filters if you use them
};

function AdminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      reinitializeAllOfUsernameSearchForm();
    };
  }, []);

  const matchingUsersList = useAppSelector((state: RootState) => selectMatchingUsersListWithId(state));
  const { searchByUsernameRequestStatus, searchByUserRoleRequestStatus } = useAppSelector((state: RootState) => state.adminDashboard);

  const [searchTypeSelectionCode, setSearchTypeSelectionCode] = useState<UsersSearchTypeOptionCode>(UsersSearchTypeOptions.OPT_USERNAME.code);

  const [username, setUsername] = useState("");
  const [usernameValidationErrMsg, setUsernameValidationErrMsg] = useState<string | null>(null);

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userRoleValidationErrMsg, setUserRoleValidationErrMsg] = useState<string | null>(null);

  const [isServerErrorUsernameSearch, setIsServerErrorUsernameSearch] = useState(false);
  const [serverErrorMsgUsernameSearch, setServerErrorMsgUsernameSearch] = useState("");

  const [isServerErrorUserRoleSearch, setIsServerErrorUserRoleSearch] = useState(false);
  const [serverErrorMsgUserRoleSearch, setServerErrorMsgUserRoleSearch] = useState("");

  const [filterModel, setFilterModel] = useState<GridFilterModel>(INITIAL_FILTER_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  useEffect(() => {
    setFilterModel(INITIAL_FILTER_MODEL);
    setSortModel([]);
  }, [matchingUsersList]);

  const reinitializeAllOfUsernameSearchForm = () => {
    reinitializeUsernameSearchErrors();
    reinitializeUsernameSearchFormValues();

    dispatch(clearSearchForUsersResults());
  };

  const reinitializeAllOfUserRoleSearchForm = () => {
    reinitializeUserRoleSearchErrors();
    reinitializeUserRoleSearchFormValues();

    dispatch(clearSearchForUsersResults());
  }

  const reinitializeUsernameSearchErrors = () => {
    setIsServerErrorUsernameSearch(false);
    setServerErrorMsgUsernameSearch("");
  };

  const reinitializeUsernameSearchFormValues = () => {
    setUsername("");

    setUsernameValidationErrMsg(null);
  };

  const reinitializeUserRoleSearchErrors = () => {
    setIsServerErrorUserRoleSearch(false);
    setServerErrorMsgUserRoleSearch("");
  };

  const reinitializeUserRoleSearchFormValues = () => {
    setUserRole(null);

    setUserRoleValidationErrMsg(null);
  };

  const handleOnSearchUsername = async () => {
    reinitializeUsernameSearchErrors();

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
      setIsServerErrorUsernameSearch(true);

      if (error.message && error.message.length > 0) {
        setServerErrorMsgUsernameSearch(error.message);
      } else {
        console.log(error);
        setServerErrorMsgUsernameSearch(UNKNOWN_ERR_MSG);
      }
    }
  };

  const handleOnSearchUserRole = async () => {
    reinitializeUserRoleSearchErrors();

    if (!userRole) {
      setUserRoleValidationErrMsg("Role To Search By is required");
      return;
    }

    try {
      await dispatch(searchByUserRoleAction(userRole)).unwrap();
    } catch (err) {
      const error = err as SerializedError;
      setIsServerErrorUserRoleSearch(true);

      if (error.message && error.message.length > 0) {
        setServerErrorMsgUserRoleSearch(error.message);
      } else {
        console.log(error);
        setServerErrorMsgUserRoleSearch(UNKNOWN_ERR_MSG);
      }
    }
  };

  const handleSearchTypeRadioOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    reinitializeAllOfUsernameSearchForm();
    reinitializeAllOfUserRoleSearchForm();

    setSearchTypeSelectionCode((event.target as HTMLInputElement).value as UsersSearchTypeOptionCode);
  };

  const handleChangeAddRoleSelection = (event: SelectChangeEvent<UserRole>) => {
    setUserRole(event.target.value);
  };

  const columns: GridColDef<Array<UserRequestResponse>[number]>[] = [
    {
      field: 'username',
      headerName: 'Username',
      width: 150,
      editable: false
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 150,
      editable: false
    },
    {
      field: 'rolesString',
      headerName: 'Roles',
      editable: false,
      rowHeader: true,
      sortable: false,
      filterable: false,
      width: 550,
      valueGetter: (_value, row) => row.roles.join("; ")
    }
  ];

  const handleRowClick = (params: GridRowParams<UserRequestResponse & { id: string }>) => {
    navigate(`/admin/user/${params.id}`);
  };

  const isRequestPending = () => {
    return searchByUsernameRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS ||
      searchByUserRoleRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS;
  };

  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={isRequestPending()}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
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
                <Grid size={{
                  xs: 12,
                  sm: 12,
                  md: 8,
                  lg: 6
                }}>
                  <FormControl variant="standard" fullWidth required>
                    <FormLabel id="input-search-type-label">Search By</FormLabel>
                    <RadioGroup
                      aria-labelledby="input-search-type-label"
                      value={searchTypeSelectionCode}
                      name="input-search-type-radio-buttons-group"
                      onChange={handleSearchTypeRadioOnChange}
                    >
                      <FormControlLabel value={UsersSearchTypeOptions.OPT_USERNAME.code} control={<Radio />} label={UsersSearchTypeOptions.OPT_USERNAME.label} />
                      <FormControlLabel value={UsersSearchTypeOptions.OPT_USER_ROLE.code} control={<Radio />} label={UsersSearchTypeOptions.OPT_USER_ROLE.label} />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Box>

              {searchTypeSelectionCode === UsersSearchTypeOptions.OPT_USERNAME.code && (
                <Box component="form">
                  <Typography variant="h6" component="div">
                    Search For Users By Username
                  </Typography>

                  {isServerErrorUsernameSearch && (
                    <Box>
                      <Alert severity="error">
                        {serverErrorMsgUsernameSearch}
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
                    <Button sx={{ marginRight: 1 }} onClick={handleOnSearchUsername} variant="contained">Search</Button>
                    <Button onClick={reinitializeAllOfUsernameSearchForm} variant="outlined">Cancel</Button>
                  </Grid>
                </Box>
              )}

              {searchTypeSelectionCode === UsersSearchTypeOptions.OPT_USER_ROLE.code && (
                <Box component="form">
                  <Typography variant="h6" component="div">
                    Search For Users By Role
                  </Typography>

                  {isServerErrorUserRoleSearch && (
                    <Box>
                      <Alert severity="error">
                        {serverErrorMsgUserRoleSearch}
                      </Alert>
                    </Box>
                  )}

                  <Grid size={{
                    xs: 12,
                    sm: 12,
                    md: 8,
                    lg: 6
                  }}>
                    <FormControl fullWidth error={userRoleValidationErrMsg !== null} variant="standard" size="small" required>
                      <InputLabel id="seachByRole-form-roles-label">Role To Search By</InputLabel>
                      <Select
                        labelId="seachByRole-form-roles-label"
                        id="seachByRole-form-roles-select"
                        value={userRole || ''}
                        label="Role To Search By"
                        onChange={handleChangeAddRoleSelection}
                      >
                        {Object.values(UserRole)
                          .map(role => (
                            <MenuItem key={`${role}-add-select-option`} value={role}>{role}</MenuItem>
                          ))
                        }
                      </Select>
                      {userRoleValidationErrMsg !== null && (
                        <FormHelperText id="seachByRole-form-roles-error">{userRoleValidationErrMsg}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid sx={{
                    marginTop: 1
                  }}>
                    <Button sx={{ marginRight: 1 }} onClick={handleOnSearchUserRole} variant="contained">Search</Button>
                    <Button onClick={reinitializeAllOfUserRoleSearchForm} variant="outlined">Cancel</Button>
                  </Grid>
                </Box>
              )}

              <Box sx={{ height: 650, width: '100%' }}>
                <DataGrid
                  loading={isRequestPending()}
                  rows={matchingUsersList}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10,
                      },
                    },
                  }}
                  pageSizeOptions={[10]}
                  onRowClick={handleRowClick}
                  filterModel={filterModel}
                  onFilterModelChange={(newModel) => setFilterModel(newModel)}
                  sortModel={sortModel}
                  onSortModelChange={(newModel) => setSortModel(newModel)}
                />
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </>
  )
}

export default AdminDashboard;
