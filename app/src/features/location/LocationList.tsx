import { Backdrop, CircularProgress, Grid, Box, Stack, Typography, Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { DataGrid, GridActionsCellItem, type GridColDef, type GridFilterModel, type GridRowParams, type GridSortModel } from "@mui/x-data-grid";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import { selectLocationListWithId } from "./locationSelectors";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import { clearLocationsList, getAllLocationsAction, deleteLocationAction } from "./locationSlice";
import type { Location } from "../../constants/locationConstants";
import { UserRole } from "../../constants/userConstants";

const INITIAL_FILTER_MODEL: GridFilterModel = {
  items: [],
  quickFilterValues: [], // Reset quick filters if you use them
};

function LocationList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const locationsList = useAppSelector((state: RootState) => selectLocationListWithId(state));
  const { getAllLocationsRequestStatus } = useAppSelector((state: RootState) => state.location);
  const { currentUser } = useAppSelector((state: RootState) => state.user);
  const { roles = [] } = currentUser ?? {};
  const isAdminUser = roles.includes(UserRole.ROLE_ADMIN);

  const [isShowDeleteLocationModal, setIsShowDeleteLocationModal] = useState(false);
  const [deleteLocation, setDeleteLocation] = useState<Location | null>(null);

  const [filterModel, setFilterModel] = useState<GridFilterModel>(INITIAL_FILTER_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const [isServerError, setIsServerError] = useState(false);
  const [serverErrorMsg, setServerErrorMsg] = useState("");

  useEffect(() => {
    const getAllLocationsFunc = async () => {
      try {
        await dispatch(getAllLocationsAction()).unwrap();
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

    getAllLocationsFunc();

    // Clear locations list Redux state when component unmounts
    return () => {
      dispatch(clearLocationsList());
    };
  }, []);

  const isRequestPending = () => {
    return getAllLocationsRequestStatus === REDUX_ACTION_STATUS.PENDING_STATUS;
  };

  const handleDeleteLocationClick = (locationUuid: string) => {
    const locationToDelete = locationsList.find(location => location.locationUuid === locationUuid);

    if (locationToDelete == undefined) {
      throw new Error(`Location to be deleted could not be found by locationUuid: ${locationUuid}`);
    }

    setIsServerError(false);
    setServerErrorMsg("");

    setDeleteLocation(locationToDelete);
    setIsShowDeleteLocationModal(true);
  }

  const handleEditLocationClick = (locationUuid: string) => {
    navigate(`/editLocation/${locationUuid}`);
  };

  const columns: GridColDef<Array<Location>[number]>[] = [
      {
        field: 'btnActions',
        type: 'actions',
        headerName: '',
        editable: false,
        rowHeader: true,
        sortable: false,
        filterable: false,
        width: 100,
        getActions: (params: GridRowParams) => [
          <GridActionsCellItem
            icon={<DeleteForeverIcon
              sx={{ 
                fontSize: '1.5rem',
                color: 'error.main',
                '&:hover': { color: 'error.dark' } 
              }} 
            />}
            label="Delete"
            onClick={() => handleDeleteLocationClick(params.id as string)}
          />,
          <GridActionsCellItem
            icon={<EditIcon
              sx={{ 
                fontSize: '1.5rem',
                color: 'primary.main',
                '&:hover': { color: 'primary.dark' } 
              }}
            />}
            label="Edit"
            onClick={() => handleEditLocationClick(params.id as string)}
          />
        ]
      },
      {
        field: 'locationName',
        headerName: 'Name',
        width: 250,
        editable: false
      },
      {
        field: 'capacity',
        headerName: 'Capacity',
        width: 100,
        editable: false
      },
      {
        field: 'locationDescription',
        headerName: 'Description',
        editable: false,
        width: 550
      }
    ];

  const handleNoDeleteLocation = () => {
    setIsShowDeleteLocationModal(false);
    setDeleteLocation(null);
  };

  const handleYesDeleteLocation = async () => {
    if (deleteLocation === null) {
      throw new Error(`Value of deleteLocation is null when handleYesDeleteLocation invoked`);
    }

    try {
      const response = await dispatch(deleteLocationAction(deleteLocation.locationUuid)).unwrap();

      setIsShowDeleteLocationModal(false);
      setDeleteLocation(null);

      enqueueSnackbar(`Location ${response.locationName} has been successfully deleted`, { variant: "success" });
    } catch (err) {
      const error = err as SerializedError;
      setIsShowDeleteLocationModal(false);
      setDeleteLocation(null);
      
      setIsServerError(true);

      if (error.message && error.message.length > 0) {
        setServerErrorMsg(error.message);
      } else {
        console.log(error);
        setServerErrorMsg(UNKNOWN_ERR_MSG);
      }
    }
  }

  return (
    <>
      {isShowDeleteLocationModal && (
        <Dialog
          open={isShowDeleteLocationModal}
          onClose={handleNoDeleteLocation}
          aria-labelledby="alert-dialog-delete-location--title"
          aria-describedby="alert-dialog-delete-location--description"
          role="alertdialog"
          closeAfterTransition={false}
        >
          <DialogTitle id="alert-dialog-delete-location--title">
            {"Delete Location"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-delete-location--description">
              Are you sure you want to delete location {deleteLocation ? deleteLocation.locationName : ''}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleNoDeleteLocation} autoFocus>
              No
            </Button>
            <Button color="error" variant="contained" onClick={handleYesDeleteLocation}>Yes</Button>
          </DialogActions>
        </Dialog>
      )}
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
                Locations
              </Typography>

              {isAdminUser && (
                <Box sx={{ marginTop: 1 }}>
                  <Button variant="contained" onClick={() => navigate("/createLocation")}>Add New Location</Button>
                </Box>
              )}

              {isServerError && (
                <Box sx={{ marginTop: 1 }}>
                  <Alert color="error">{serverErrorMsg}</Alert>
                </Box>
              )}

              <Box sx={{ height: 650, width: '100%' }}>
                <DataGrid
                  loading={isRequestPending()}
                  rows={locationsList}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 10,
                      },
                    },
                  }}
                  pageSizeOptions={[10]}
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
  );
}

export default LocationList;
