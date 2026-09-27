import { Box, Grid, Stack, Typography } from "@mui/material";
import { useParams } from "react-router";

function EditUserRoles() {
  const { userUuid } = useParams<string>();

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
        <Box>
          <Stack spacing={2} sx={{
            marginTop: 2
          }}>
            <Typography variant="h5" component="div">
              Edit User Roles
            </Typography>

            <Box>
              {userUuid}
            </Box>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  )
}

export default EditUserRoles;
