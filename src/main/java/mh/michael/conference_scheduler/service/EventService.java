package mh.michael.conference_scheduler.service;

import static mh.michael.conference_scheduler.constants.Constants.INTERNAL_SERVER_ERROR_MSG;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.EventDTO;
import mh.michael.conference_scheduler.dto.NewEventRequestDTO;
import mh.michael.conference_scheduler.model.Event;
import mh.michael.conference_scheduler.model.Location;
import mh.michael.conference_scheduler.model.Member;
import mh.michael.conference_scheduler.model.User;
import mh.michael.conference_scheduler.repository.EventRepository;
import mh.michael.conference_scheduler.repository.LocationRepository;
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
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EventService {
  private final EventRepository eventRepository;
  private final UserRepository userRepository;
  private final LocationRepository locationRepository;

  public EventService(
    EventRepository eventRepository,
    UserRepository userRepository,
    LocationRepository locationRepository
  ) {
    this.eventRepository = eventRepository;
    this.userRepository = userRepository;
    this.locationRepository = locationRepository;
  }

  private boolean isLocationEventOverlap(Set<Event> locationEvents, Instant startDateTime, Instant endDateTime) {
    AtomicBoolean isOverlap = new AtomicBoolean(false);

    locationEvents.forEach(locationEvent -> {
      if (locationEvent.getStartDateTime().isBefore(endDateTime) &&
        locationEvent.getEndDateTime().isAfter(startDateTime)
      ) {
        isOverlap.set(true);
      }
    });

    return isOverlap.get();
  }

  @Transactional
  public EventDTO createEvent(
    JwtUserDetails jwtUserDetails,
    NewEventRequestDTO newEventRequestDTO
  ) {
    Instant startDateTime = Instant.parse(newEventRequestDTO.getStartDateTime());
    Instant endDateTime = Instant.parse(newEventRequestDTO.getEndDateTime());

    if (endDateTime.isBefore(startDateTime) || endDateTime.equals(startDateTime)) {
      log.error("endDateTime is before or equal to startDateTime");
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End Date/Time cannot be equal to or before Start Date/Time");
    }

    Optional<User> optCreatedByUser = userRepository.findByUserUuid(jwtUserDetails.getUserUuid());

    if (optCreatedByUser.isEmpty()) {
      log.error("User with UUID of {} not found in createEvent service method", jwtUserDetails.getUserUuid());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    User createdByUser = optCreatedByUser.get();

    UUID locationUuid = UuidMethods.handleUuidFromStringError(
      newEventRequestDTO.getLocationUuid(),
      "Location UUID is invalid",
      HttpStatus.BAD_REQUEST
    );

    Optional<Location> optLocation = locationRepository.findByLocationUuid(locationUuid);

    if (optLocation.isEmpty()) {
      log.error("Location with UUID of {} not found in createEvent service method", locationUuid);
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    Location location = optLocation.get();

    Set<Event> locationEvents = location.getEvents();

    boolean isOverlap = isLocationEventOverlap(locationEvents, startDateTime, endDateTime);

    if (isOverlap) {
      log.warn("Location {} has an event that overlaps with the event being created", locationUuid);
      throw new ResponseStatusException(HttpStatus.CONFLICT, "This location is already reserved during the requested data/time");
    }

    Event newEvent = Event.builder()
      .eventUuid(UUID.randomUUID())
      .createdByUser(createdByUser)
      .startDateTime(startDateTime)
      .endDateTime(endDateTime)
      .title(newEventRequestDTO.getTitle())
      .description(newEventRequestDTO.getDescription())
      .maxAttendees(newEventRequestDTO.getMaxAttendees())
      .location(location)
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
  public EventDTO removeMemberFromEvent(
    JwtUserDetails jwtUserDetails,
    String eventUuidStr
  ) {
    UUID eventUuid = UuidMethods.handleUuidFromStringError(
      eventUuidStr,
      "Event UUID is invalid",
      HttpStatus.BAD_REQUEST
    );

    Optional<User> optUser = userRepository.findByUserUuid(jwtUserDetails.getUserUuid());

    if (optUser.isEmpty()) {
      log.error("User with UUID of {} not found in removeMemberFromEvent service method", jwtUserDetails.getUserUuid());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    User user = optUser.get();

    if (user.getMember() == null) {
      log.warn("User {} with null member attempted to remove themself event {}", user.getUserUuid(), eventUuid);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The current user does not have an associated member record to remove themselves from an event. Create a member record and try again.");
    }

    Member member = user.getMember();

    Optional<Event> optEvent = eventRepository.findByEventUuid(eventUuid);

    if (optEvent.isEmpty()) {
      log.error("Event with UUID of {} not found in removeMemberFromEvent service method", eventUuid);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event not found");
    }

    Event event = optEvent.get();

    if (!event.getMembers().contains(member)) {
      log.error("Member uuid {} not found as member of event uuid {}", member.getMemberUuid().toString(), event.getEventUuid().toString());
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Member cannot be removed from this event, as they have not previously joined this event");
    }

    event.removeMemberFromEvent(member);

    Event updatedEvent = eventRepository.save(event);
    return ConvertDTOUtil.convertEventToEventDTO(updatedEvent);
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

    if (event.getMembers().contains(member)) {
      log.error("Member uuid {} has already joined this event {}", member.getMemberUuid().toString(), event.getEventUuid().toString());
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Member cannot join this event, as they have already joined it");
    }

    if (event.getMembers().size() >= event.getMaxAttendees()) {
      log.error("Maximum number of attendees has already been reached for this event uuid {}", eventUuid);
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Unable to join this event; the maximum number of attendees has already been reached");
    }

    boolean isConflictingEvent = eventRepository.existsOverlappingForMember(
      event.getStartDateTime(),
      event.getEndDateTime(),
      member
    );

    if (isConflictingEvent) {
      log.warn("Conflicting event when trying to add event");
      throw new ResponseStatusException(HttpStatus.CONFLICT, "This member has an existing event which conflicts with this event's start and end date/time");
    }

    event.addMemberToEvent(member);

    Event updatedEvent = eventRepository.save(event);
    return ConvertDTOUtil.convertEventToEventDTO(updatedEvent);
  }

  @Transactional
  public EventDTO deleteEvent(String eventUuidString) {
    UUID eventUuid = UuidMethods.handleUuidFromStringError(
      eventUuidString,
      "Event UUID is invalid",
      HttpStatus.BAD_REQUEST
    );

    Optional<Event> optEvent = eventRepository.findByEventUuid(eventUuid);

    if (optEvent.isEmpty()) {
      log.error("Event with UUID of {} not found in deleteEvent service method", eventUuid);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
    }

    Event event = optEvent.get();

    eventRepository.delete(event);

    return ConvertDTOUtil.convertEventToEventDTO(event);
  }
}
