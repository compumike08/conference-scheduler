import axios from "axios";
import type { Location } from "../constants/locationConstants";
import { UNKNOWN_ERR_MSG } from "../constants/globalConstants";

export interface CreateLocationRequest {
  locationName: string,
  capacity: number,
  locationDescription: string
}

export interface EditLocationRequest {
  locationUuid: string,
  locationName: string,
  capacity: number,
  locationDescription: string
}

export async function getAllLocations(): Promise<Array<Location>> {
  const url = `/api/location/allLocations`;

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

export async function createNewLocation(data: CreateLocationRequest): Promise<Location> {
  const url = `/api/location/createLocation`;

  try {
    const response = await axios.post(url, data);
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

export async function deleteLocation(locationUuid: string): Promise<Location> {
  const url = `/api/location/deleteLocation/${locationUuid}`;

  try {
    const response = await axios.delete(url);
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

export async function getLocation(locationUuid: string): Promise<Location> {
  const url = `/api/location/getLocation/${locationUuid}`;

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

export async function editLocation(data: EditLocationRequest): Promise<Location> {
  const url = `/api/location/editLocation`;

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
