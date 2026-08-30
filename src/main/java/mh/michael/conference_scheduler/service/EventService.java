package mh.michael.conference_scheduler.service;

import static mh.michael.conference_scheduler.constants.Constants.INTERNAL_SERVER_ERROR_MSG;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.EventDTO;
import mh.michael.conference_scheduler.dto.NewEventRequestDTO;
import mh.michael.conference_scheduler.model.Event;
import mh.michael.conference_scheduler.model.Member;
import mh.michael.conference_scheduler.model.User;
import mh.michael.conference_scheduler.repository.EventRepository;
import mh.michael.conference_scheduler.repository.UserRepository;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.util.ConvertDTOUtil;
import mh.michael.conference_scheduler.util.UuidMethods;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EventService {
  private final EventRepository eventRepository;
  private final UserRepository userRepository;

  public EventService(EventRepository eventRepository, UserRepository userRepository) {
    this.eventRepository = eventRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public EventDTO createEvent(
    JwtUserDetails jwtUserDetails,
    NewEventRequestDTO newEventRequestDTO
  ) {
    if (newEventRequestDTO.getTitle() == null || newEventRequestDTO.getTitle().isEmpty()) {
      log.error("title is null or empty");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
    }

    if (newEventRequestDTO.getStartDateTime() == null) {
      log.error("startDateTime is null");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start Date/Time is required");
    }

    if (newEventRequestDTO.getEndDateTime() == null) {
      log.error("endDateTime is null");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End Date/Time is required");
    }

    if (
      newEventRequestDTO.getEndDateTime().isBefore(newEventRequestDTO.getStartDateTime()) ||
        newEventRequestDTO.getEndDateTime().equals(newEventRequestDTO.getStartDateTime())
    ) {
      log.error("endDateTime is before or equal to startDateTime");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End Date/Time cannot be equal to or before Start Date/Time");
    }

    Instant currentDateTime = Instant.now();

    if (
      newEventRequestDTO.getStartDateTime().isBefore(currentDateTime) ||
        newEventRequestDTO.getStartDateTime().equals(currentDateTime)
    ) {
      log.error("startDateTime is before or equal to currentDateTime");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start Date/Time cannot be equal to or before the current date and time");
    }

    boolean isConflictingEvent = eventRepository.existsOverlapping(
      newEventRequestDTO.getStartDateTime(),
      newEventRequestDTO.getEndDateTime()
    );

    if (isConflictingEvent) {
      log.warn("Conflicting event when trying to add event");
      throw new ResponseStatusException(HttpStatus.CONFLICT, "An existing event conflicts with the start and end date/time");
    }

    Optional<User> optCreatedByUser = userRepository.findByUserUuid(jwtUserDetails.getUserUuid());

    if (optCreatedByUser.isEmpty()) {
      log.error("User with UUID of {} not found in createEvent service method", jwtUserDetails.getUserUuid());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    User createdByUser = optCreatedByUser.get();

    Event newEvent = Event.builder()
      .eventUuid(UUID.randomUUID())
      .createdByUser(createdByUser)
      .startDateTime(newEventRequestDTO.getStartDateTime())
      .endDateTime(newEventRequestDTO.getEndDateTime())
      .title(newEventRequestDTO.getTitle())
      .description(newEventRequestDTO.getDescription())
      .build();

    Event savedEvent = eventRepository.save(newEvent);

    return ConvertDTOUtil.convertEventToEventDTO(savedEvent);
  }

  @Transactional
  public List<EventDTO> getAllEvents() {
    List<Event> allEvents = eventRepository.findAll();

    return allEvents.stream()
      .map(ConvertDTOUtil::convertEventToEventDTO)
      .collect(Collectors.toList());
  }

  @Transactional
  public EventDTO joinEvent(
    @AuthenticationPrincipal JwtUserDetails jwtUserDetails,
    String eventUuidStr
  ) {
    UUID eventUuid = UuidMethods.handleUuidFromStringError(
      eventUuidStr,
      "Event UUID is invalid",
      HttpStatus.BAD_REQUEST
    );

    Optional<User> optUser = userRepository.findByUserUuid(jwtUserDetails.getUserUuid());

    if (optUser.isEmpty()) {
      log.error("User with UUID of {} not found in joinEvent service method", jwtUserDetails.getUserUuid());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    User user = optUser.get();

    if (user.getMember() == null) {
      log.warn("User {} with null member attempted to join event {}", user.getUserUuid(), eventUuid);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The current user does not have an associated member record to join an event. Create a member record and try again.");
    }

    Member member = user.getMember();

    Optional<Event> optEvent = eventRepository.findByEventUuid(eventUuid);

    if (optEvent.isEmpty()) {
      log.error("Event with UUID of {} not found in joinEvent service method", eventUuid);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event not found");
    }

    Event event = optEvent.get();

    event.addMemberToEvent(member);

    Event updatedEvent = eventRepository.save(event);
    return ConvertDTOUtil.convertEventToEventDTO(updatedEvent);
  }
}
