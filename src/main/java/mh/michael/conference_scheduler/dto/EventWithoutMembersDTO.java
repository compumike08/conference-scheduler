package mh.michael.conference_scheduler.dto;

import lombok.*;
import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class EventWithoutMembersDTO {
  private String eventUuid;
  private String title;
  private String description;
  private Long maxAttendees;
  private Instant startDateTime;
  private Instant endDateTime;
  private String locationUuid;

  private UserWithoutMemberDTO createdByUser;
}
