import axios from "axios";
import { UNKNOWN_ERR_MSG } from "../constants/globalConstants";
import type { UserRole, UserRoleNoMemberOrUser } from "../constants/userConstants";

export interface UserRequestResponse {
  userUuid: string,
  username: string,
  email: string,
  roles: Array<UserRole>,
  memberUuid: string
}

export interface EditRoleForUserRequest {
  userUuid: string,
  role: UserRoleNoMemberOrUser
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

export async function searchByUsername(searchUsername: string): Promise<Array<UserRequestResponse>> {
  const url = `/api/user/searchByUsername`;
  try {
    const response = await axios.get(url, {
      params: {
        searchUsername
      }
    });
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

export async function getUserByUuid(searchUuid: string): Promise<UserRequestResponse> {
  const url = `/api/user/userUuid/${searchUuid}`;
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

export async function addRoleToUser(data: EditRoleForUserRequest): Promise<UserRequestResponse> {
  const url = `/api/user/addRole`;
  try {
    const response = await axios.put(url, data);
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

    throw new Error(UNKNOWN_ERR_MSG);
  }
}

export async function removeRoleFromUser(data: EditRoleForUserRequest): Promise<UserRequestResponse> {
  const url = `/api/user/removeRole`;
  try {
    const response = await axios.put(url, data);
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

    throw new Error(UNKNOWN_ERR_MSG);
  }
}
