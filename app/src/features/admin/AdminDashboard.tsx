import { Box, Grid, Stack, Typography } from "@mui/material";

function AdminDashboard() {
  return (
    <Grid container sx={{
      justifyContent: "center"
    }}>
      <Grid size={{
        xs: 12,
        sm: 8,
        md: 6,
        lg: 4
      }}>
        <Box component="form">
          <Stack spacing={2} sx={{
            marginTop: 2
          }}>
            <Typography variant="h5" component="div">
              Admin Dashboard
            </Typography>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  )
}

export default AdminDashboard;
