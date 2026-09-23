import axios from "axios";
import { decodeJwt } from "jose";
import { TOKEN_SESSION_ATTRIBUTE_NAME } from "../constants/authConstants";

let axiosHeaderInterceptor: number | null = null;

function createJWTToken(token: string) {
  return "Bearer " + token;
}

function isUserLoggedIn() {
  const token = sessionStorage.getItem(TOKEN_SESSION_ATTRIBUTE_NAME);
  if (token === null) return false;
  return true;
}

function setupAxiosInterceptors(token: string) {
  axiosHeaderInterceptor = axios.interceptors.request.use((config) => {
    if (isUserLoggedIn()) {
      config.headers.authorization = token;
    }
    return config;
  });
}

export async function refreshToken() {
  // Dummy function for now
  // TODO: Implement actual function
}

export function registerSuccessfulLoginForJwt(token: string) {
  const bearerToken = createJWTToken(token);
  sessionStorage.setItem(TOKEN_SESSION_ATTRIBUTE_NAME, bearerToken);
  setupAxiosInterceptors(bearerToken);

  const decodedToken = decodeJwt(token);

  if (!decodedToken.exp) {
    throw new Error("Auth token from server does not have 'exp' claim");
  }

  const secsUntilExpiration = decodedToken.exp - Math.floor(Date.now() / 1000);

  // The value of 120 represents 120 seconds, or two minutes
  const timerValueForRefresh = secsUntilExpiration - 120;

  // The value of 60 represents 60 seconds, or one minute
  if (timerValueForRefresh < 60) {
    console.log(
      "Unable to set refresh token timer due to token expiring too soon"
    );
    throw new Error("Error setting refresh token timer");
  }

  setTimeout(refreshToken, timerValueForRefresh * 1000);
}

export function logout() {
  sessionStorage.clear();

  if (axiosHeaderInterceptor) {
    axios.interceptors.request.eject(axiosHeaderInterceptor);
    axiosHeaderInterceptor = null;
  }
}
