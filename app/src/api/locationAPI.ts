import axios from "axios";
import type { Location } from "../constants/locationConstants";
import { UNKNOWN_ERR_MSG } from "../constants/globalConstants";

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
