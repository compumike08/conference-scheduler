import axios from "axios";
import { UNKNOWN_ERR_MSG } from "../constants/globalConstants";
import type { UserRole } from "../constants/userConstants";

export interface UserRequestResponse {
  userUuid: string,
  username: string,
  email: string,
  roles: Array<UserRole>,
  memberUuid: string
}

export async function getCurrentUser(): Promise<UserRequestResponse> {
  const url = `/api/user/currentUser`;
  try {
    const response = await axios.get(url);
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
