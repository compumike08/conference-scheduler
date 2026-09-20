import { Box, Button, Grid, Stack } from "@mui/material";
import './Home.css'
import { Link } from "react-router";

function Home() {

  return (
    <Grid container size={12} sx={{
      justifyContent: "center"
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
  )
}

export default Home;
