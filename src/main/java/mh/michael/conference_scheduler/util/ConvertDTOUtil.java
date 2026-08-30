package mh.michael.conference_scheduler.util;

import mh.michael.conference_scheduler.dto.*;
import mh.michael.conference_scheduler.model.Event;
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

  public static UserWithoutMemberDTO convertUserToUserWithoutMemberDTO(User user) {
    return UserWithoutMemberDTO.builder()
      .email(user.getEmail())
      .roles(user.getRoles().parallelStream().map(UserRole::getName).collect(Collectors.toSet()))
      .username(user.getUsername())
      .userUuid(user.getUserUuid().toString())
      .memberUuid(user.getMember() == null ? null : user.getMember().getMemberUuid().toString())
      .build();
  }

  public static MemberDTO convertMemberToMemberDTO(Member member) {
    return MemberDTO.builder()
      .memberUuid(member.getMemberUuid().toString())
      .firstName(member.getFirstName())
      .lastName(member.getLastName())
      .userUuid(member.getMemberUser().getUserUuid().toString())
      .events(member.getEvents().stream()
        .map(ConvertDTOUtil::convertEventToEventWithoutMembersDTO).collect(Collectors.toList()))
      .build();
  }

  public static MemberWithoutEventsDTO convertMemberToMemberWithoutEventsDTO(Member member) {
    return MemberWithoutEventsDTO.builder()
      .memberUuid(member.getMemberUuid().toString())
      .firstName(member.getFirstName())
      .lastName(member.getLastName())
      .userUuid(member.getMemberUser().getUserUuid().toString())
      .build();
  }

  public static EventDTO convertEventToEventDTO(Event event) {
    return EventDTO.builder()
      .eventUuid(event.getEventUuid().toString())
      .title(event.getTitle())
      .description(event.getDescription())
      .startDateTime(event.getStartDateTime())
      .endDateTime(event.getEndDateTime())
      .members(event.getMembers().stream()
        .map(ConvertDTOUtil::convertMemberToMemberWithoutEventsDTO).collect(Collectors.toList()))
      .createdByUser(convertUserToUserWithoutMemberDTO(event.getCreatedByUser()))
      .build();
  }

  public static EventWithoutMembersDTO convertEventToEventWithoutMembersDTO(Event event) {
    return EventWithoutMembersDTO.builder()
      .eventUuid(event.getEventUuid().toString())
      .title(event.getTitle())
      .description(event.getDescription())
      .startDateTime(event.getStartDateTime())
      .endDateTime(event.getEndDateTime())
      .createdByUser(convertUserToUserWithoutMemberDTO(event.getCreatedByUser()))
      .build();
  }
}
