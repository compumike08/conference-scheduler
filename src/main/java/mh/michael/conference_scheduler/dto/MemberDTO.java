package mh.michael.conference_scheduler.dto;

import lombok.*;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class MemberDTO {
  private String memberUuid;
  private String firstName;
  private String lastName;

  private String userUuid;

  private List<EventWithoutMembersDTO> events;
}
