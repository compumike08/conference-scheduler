package mh.michael.conference_scheduler.dto;

import lombok.*;
import mh.michael.conference_scheduler.constants.EUserRole;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserWithoutMemberDTO {
  private String userUuid;
  private String username;
  private String email;
  private Set<EUserRole> roles;

  private String memberUuid;
}
