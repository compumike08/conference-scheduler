import { Box, Button, Grid, Stack } from "@mui/material";
import './Home.css'
import { Link } from "react-router";

function Home() {

  return (
    <Grid container sx={{
      justifyContent: "center"
    }}>
      <Grid size={{
        xs: 12,
        sm: 5,
        md: 3,
        lg: 3
      }}>
        <Box sx={{
          marginTop: 2
        }}>
          <Stack spacing={2}>
            <Button size="large" variant="contained" component={Link} to="/register">Register New User</Button>
            <Button size="large" variant="contained" component={Link} to="/login">Login</Button>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  )
}

export default Home;
