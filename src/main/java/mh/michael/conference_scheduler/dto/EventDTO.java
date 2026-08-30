package mh.michael.conference_scheduler.dto;

import lombok.*;
import java.time.Instant;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class EventDTO {
  private String eventUuid;
  private String title;
  private String description;
  private Long maxAttendees;
  private Instant startDateTime;
  private Instant endDateTime;

  List<MemberWithoutEventsDTO> members;

  UserWithoutMemberDTO createdByUser;
}
