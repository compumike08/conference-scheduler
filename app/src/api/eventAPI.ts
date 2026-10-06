import axios from "axios";
import type { RawEvent } from "../constants/eventConstants";
import { UNKNOWN_ERR_MSG } from "../constants/globalConstants";

export async function getEventsInDateRange(startDate: string, endDate: string): Promise<Array<RawEvent>> {
  const url = `/api/event/getEventsInDateRange`;

  try {
    const response = await axios.get(url, {
      params: {
        startDate,
        endDate
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
