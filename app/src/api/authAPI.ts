import axios from "axios";
import { decodeJwt } from "jose";
import { TOKEN_SESSION_ATTRIBUTE_NAME, REFRESH_SESSION_ATTRIBUTE_NAME } from "../constants/authConstants";
import { UNKNOWN_ERR_MSG } from "../constants/globalConstants";

export interface LoginRequest {
  username: string,
  password: string
}

export interface LoginResponse {
  token: string,
  refreshToken: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

let axiosHeaderInterceptor: number | null = null;
let setTimeoutRef: number | null = null;

function createJWTToken(token: string) {
  return "Bearer " + token;
}

function isUserLoggedIn() {
  const token = sessionStorage.getItem(TOKEN_SESSION_ATTRIBUTE_NAME);
  if (token === null) return false;
  return true;
}

function setupAxiosInterceptors(token: string) {
  ejectAxiosInterceptor();

  axiosHeaderInterceptor = axios.interceptors.request.use((config) => {
    if (isUserLoggedIn()) {
      config.headers.authorization = token;
    }
    return config;
  }, undefined, { synchronous: true });
}

export async function logout() {
  const url = `/api/logout`;
  try {
    await axios.post(url);
    clearSessionStorage();
    return true;
  } catch (err) {
    console.log(err);
    clearSessionStorage();

    if (axios.isAxiosError(err)) {
      if (err && err.response && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
    }

    throw new Error(UNKNOWN_ERR_MSG);
  }
}

export async function refreshToken() {
  const refreshToken = sessionStorage.getItem(REFRESH_SESSION_ATTRIBUTE_NAME);

  if (refreshToken === null) {
    throw new Error("No refresh token found in session storage");
  }

  const data: RefreshTokenRequest = {
    refreshToken
  };

  const url = `/api/refreshToken`;
  try {
    const response = await axios.post(url, data);
    registerSuccessfulLoginForJwt(response.data);
    return response.data;
  } catch (err) {
    console.log(err);

    if (axios.isAxiosError(err)) {
      if (err && err.response && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
    }

    throw new Error(UNKNOWN_ERR_MSG);
  }
}

export async function authenticate(data: LoginRequest): Promise<LoginResponse> {
  const url = `/api/authenticate`;
  try {
    const response = await axios.post(url, {
      username: data.username,
      password: data.password
    });
    registerSuccessfulLoginForJwt(response.data);
    return response.data;
  } catch (err) {
    console.log(err);

    if (axios.isAxiosError(err)) {
      if (err && err.response && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
    }

    throw new Error(UNKNOWN_ERR_MSG);
  }
}

export function registerSuccessfulLoginForJwt(data: LoginResponse) {
  const bearerToken = createJWTToken(data.token);
  sessionStorage.setItem(TOKEN_SESSION_ATTRIBUTE_NAME, bearerToken);
  sessionStorage.setItem(REFRESH_SESSION_ATTRIBUTE_NAME, data.refreshToken);
  setupAxiosInterceptors(bearerToken);

  const decodedToken = decodeJwt(data.token);

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

  setTimeoutRef = setTimeout(refreshToken, timerValueForRefresh * 1000);
}

export function clearSessionStorage() {
  sessionStorage.clear();
  ejectAxiosInterceptor();
}

export function ejectAxiosInterceptor() {
  if (setTimeoutRef !== null) {
    window.clearTimeout(setTimeoutRef);
    setTimeoutRef = null;
  }

  if (axiosHeaderInterceptor !== null) {
    axios.interceptors.request.eject(axiosHeaderInterceptor);
    axiosHeaderInterceptor = null;
  }
}
