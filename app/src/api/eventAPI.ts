import axios from "axios";
import type { RawEvent } from "../constants/eventConstants";
import { UNKNOWN_ERR_MSG } from "../constants/globalConstants";

export interface NewEventRequest {
  title: string,
  description: string,
  maxAttendees: number,
  startDateTime: string,
  endDateTime: string,
  locationUuid: string
}

export interface EditEventRequest {
  eventUuid: string,
  title: string,
  description: string,
  maxAttendees: number,
  locationUuid: string
}

export async function getEventByUuid(eventUuid: string): Promise<RawEvent> {
  const url = `/api/event/getEvent/${eventUuid}`;

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

export async function joinEvent(eventUuid: string): Promise<RawEvent> {
  const url = `/api/event/joinEvent/${eventUuid}`;

  try {
    const response = await axios.put(url);
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

export async function removeMemberFromEvent(eventUuid: string): Promise<RawEvent> {
  const url = `/api/event/removeMemberFromEvent/${eventUuid}`;

  try {
    const response = await axios.put(url);
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

export async function createNewEvent(data: NewEventRequest): Promise<RawEvent> {
  const url = `/api/event/createEvent`;

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

export async function editEvent(data: EditEventRequest): Promise<RawEvent> {
  const url = `/api/event/editEvent`;

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

export async function deleteEvent(eventUuid: string): Promise<RawEvent> {
  const url = `/api/event/deleteEvent/${eventUuid}`;

  try {
    const response = await axios.delete(url);
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
