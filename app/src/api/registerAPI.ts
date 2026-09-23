import axios from "axios";
import { UNKNOWN_ERR_MSG } from "../constants/globalConstants";
import type { UserRole } from "../constants/userConstants";

export interface NewUserRequest {
  username: string,
  email: string,
  password: string
}

export interface NewUserRequestResponse {
  userUuid: string,
  username: string,
  email: string,
  roles: Array<UserRole>
}

export async function registerUser(data: NewUserRequest): Promise<NewUserRequestResponse> {
  const url = `/api/registerUser`;
  try {
    const response = await axios.post(url, {
      username: data.username,
      email: data.email,
      password: data.password
    });
    return response.data;
  } catch (err) {
    console.log(err);

    if (axios.isAxiosError(err)) {
      if (err && err.response && err.response.data.validationErrors) {
        const errMsgAry = [];
        for (const key in err.response.data.validationErrors) {
          if (Object.hasOwn(err.response.data.validationErrors, key)) {
            errMsgAry.push(err.response.data.validationErrors[key]);
          }
        }

        throw new Error(errMsgAry.join('; '));
      } else if (err && err.response && err.response.data.error) {
        throw new Error(err.response.data.error);
      }
    }
  }
  throw new Error(UNKNOWN_ERR_MSG);
}
