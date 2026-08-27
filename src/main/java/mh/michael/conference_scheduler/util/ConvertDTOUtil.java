package mh.michael.conference_scheduler.util;

import mh.michael.conference_scheduler.dto.MemberDTO;
import mh.michael.conference_scheduler.dto.UserDTO;
import mh.michael.conference_scheduler.model.Member;
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
      .member(user.getMember() != null ? convertMemberToMemberDTO(user.getMember()) : null)
      .build();
  }

  public static MemberDTO convertMemberToMemberDTO(Member member) {
    return MemberDTO.builder()
      .memberUuid(member.getMemberUuid().toString())
      .firstName(member.getFirstName())
      .lastName(member.getLastName())
      .userUuid(member.getMemberUser().getUserUuid().toString())
      .build();
  }
}
