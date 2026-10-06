import type { Dayjs } from "dayjs";
import type { Location } from "./locationConstants";
import type { Member } from "./memberConstants";
import type { UserRequestResponse } from "../api/userAPI";

export interface RawEvent {
  eventUuid: string,
  title: string,
  description: string,
  maxAttendees: number,
  startDateTime: string,
  endDateTime: string,
  location: Location,
  members: Array<Member>,
  createdByUser: UserRequestResponse
}

export interface Event {
  id: string,
  eventUuid: string,
  title: string,
  description: string,
  maxAttendees: number,
  startDateTime: Dayjs,
  endDateTime: Dayjs,
  location: Location,
  members: Array<Member>,
  createdByUser: UserRequestResponse
}
