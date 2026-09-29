import { Backdrop, CircularProgress, Grid, Box, Stack, Typography, Alert, Button } from "@mui/material";
import { DataGrid, type GridColDef, type GridFilterModel, type GridSortModel } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import type { SerializedError } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector, type RootState } from "../../app/store";
import { selectLocationListWithId } from "./locationSelectors";
import { REDUX_ACTION_STATUS, UNKNOWN_ERR_MSG } from "../../constants/globalConstants";
import { clearLocationsList, getAllLocationsAction } from "./locationSlice";
import type { Location } from "../../constants/locationConstants";
import { useNavigate } from "react-router";

const INITIAL_FILTER_MODEL: GridFilterModel = {
  items: [],
  quickFilterValues: [], // Reset quick filters if you use them
};

function LocationList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const locationsList = useAppSelector((state: RootState) => selectLocationListWithId(state));
  const { getAllLocationsRequestStatus } = useAppSelector((state: RootState) => state.location);

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

  const columns: GridColDef<Array<Location>[number]>[] = [
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
                Locations
              </Typography>

              <Box sx={{ marginTop: 1 }}>
                <Button variant="contained" onClick={() => navigate("/createLocation")}>Add New Location</Button>
              </Box>

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
