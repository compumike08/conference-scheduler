# Conference Scheduler

## Running locally in DEV mode

### Generate an RSA key pair

```bash
# 2048-bit RSA private key, PKCS#8 format (required)
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem

# Derive the matching public key
openssl rsa -pubout -in private.pem -out public.pem
```

### Environment variables
You must set the following environment variables on your local machine before running this application locally:

- CONFERENCE_SCHDLR_APP_JWT_RSA_PUBLIC_KEY - _Copy and paste the generated RSA public key into this variable._
  - For Windows computers: _You must add a newline character at the end of each line, then move each line into a single line, before copying and pasting._
  - For Mac & Linux computers: _Keep the structure of the file intact, but put a single quote before the start of the first line and after the end of the last line, before copying and pasting._
- CONFERENCE_SCHDLR_APP_JWT_RSA_PRIVATE_KEY - _Copy and paste the generated RSA public key into this variable._
  - For Windows computers: _You must add a newline character at the end of each line, then move each line into a single line, before copying and pasting._
  - For Mac & Linux computers: _Keep the structure of the file intact, but put a single quote before the start of the first line and after the end of the last line, before copying and pasting._

## Copyright
&copy; 2026 compumike08 - All Rights Reserved
