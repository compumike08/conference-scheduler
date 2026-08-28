package mh.michael.conference_scheduler.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class AddRoleToUserRequestDTO {
  String userUuid;
  String newRole;
}
