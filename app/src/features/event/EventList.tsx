import { Backdrop, CircularProgress, Grid, Box, Stack, Typography } from "@mui/material";

function EventList() {
  return (
    <>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={false}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container>
        <Grid
          sx={{
            xs: 12
          }}
        >
          <Typography variant="h5" component="div" sx={{
            marginTop: 2
          }}>
            Events
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid size={{
          xs: 12,
          md: 3
        }}>
          <Box>
            <Stack spacing={2} sx={{
              marginTop: 2
            }}>
              Day 1
            </Stack>
          </Box>
        </Grid>
        <Grid size={{
          xs: 12,
          md: 3
        }}>
          <Box>
            <Stack spacing={2} sx={{
              marginTop: 2
            }}>
              Day 2
            </Stack>
          </Box>
        </Grid>
        <Grid size={{
          xs: 12,
          md: 3
        }}>
          <Box>
            <Stack spacing={2} sx={{
              marginTop: 2
            }}>
              Day 3
            </Stack>
          </Box>
        </Grid>
        <Grid size={{
          xs: 12,
          md: 3
        }}>
          <Box>
            <Stack spacing={2} sx={{
              marginTop: 2
            }}>
              Day 4
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default EventList;
