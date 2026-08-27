package mh.michael.conference_scheduler.dto;

import lombok.*;

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
}
