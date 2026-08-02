package mh.michael.conference_scheduler.util;

import mh.michael.conference_scheduler.dto.UserDTO;
import mh.michael.conference_scheduler.model.User;
import mh.michael.conference_scheduler.model.UserRole;
import java.util.stream.Collectors;

public class ConvertDTOUtil {
  private ConvertDTOUtil() {}

  public static UserDTO convertUserToUserDTO(User user) {
    return UserDTO.builder()
      .email(user.getEmail())
      .roles(user.getRoles().parallelStream().map(UserRole::getName).collect(Collectors.toSet()))
      .username(user.getUsername())
      .userUuid(user.getUserUuid().toString())
      .build();
  }
}
