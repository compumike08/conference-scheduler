package mh.michael.conference_scheduler.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import mh.michael.conference_scheduler.annotations.ValidUuid;
import mh.michael.conference_scheduler.annotations.ValueOfEnum;
import mh.michael.conference_scheduler.constants.EUserRole;
import mh.michael.conference_scheduler.constants.EUserRoleNoMemberOrUser;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class AddRoleToUserRequestDTO {
  @NotBlank(message = "User UUID is required")
  @ValidUuid(message = "Invalid user UUID")
  String userUuid;

  @NotBlank(message = "New role is required")
  @ValueOfEnum(enumClass = EUserRoleNoMemberOrUser.class, message = "Invalid role")
  String newRole;
}
