import { Box, Button, FormControl, Grid, Input, InputLabel, Stack } from "@mui/material";
import { useState } from "react";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

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
        <Box component="form" >
          <Stack spacing={2}>
            <FormControl variant="standard" fullWidth>
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
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <InputLabel htmlFor="input-email">Email</InputLabel>
              <Input
                id="input-email"
                value={email}
                onChange={(event) => {
                  const emailValue = event.target.value;

                  if (emailValue.length <= 100) {
                    setEmail(event.target.value);
                  }
                }}
              />
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <InputLabel htmlFor="input-password">Password</InputLabel>
              <Input
                type="password"
                id="input-password"
                value={password}
                onChange={(event) => {
                  const passwordValue = event.target.value;

                  if (passwordValue.length <= 50) {
                    setPassword(event.target.value);
                  }
                }}
              />
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <InputLabel htmlFor="input-password-confirm">Confirm Password</InputLabel>
              <Input
                type="password"
                id="input-password-confirm"
                value={passwordConfirm}
                onChange={(event) => {
                  const passwordConfirmValue = event.target.value;

                  if (passwordConfirmValue.length <= 50) {
                    setPasswordConfirm(event.target.value);
                  }
                }}
              />
            </FormControl>

            <Grid container sx={{
              justifyContent: "space-between"
            }}>
              <Button variant="contained">Submit</Button>
              <Button variant="outlined">Cancel</Button>
            </Grid>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  )
}

export default Register;
