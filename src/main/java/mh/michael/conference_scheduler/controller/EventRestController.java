package mh.michael.conference_scheduler.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.annotations.IsValidInstant;
import mh.michael.conference_scheduler.dto.EditEventRequestDTO;
import mh.michael.conference_scheduler.dto.EventDTO;
import mh.michael.conference_scheduler.dto.NewEventRequestDTO;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.service.EventService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/event")
@Slf4j
public class EventRestController {
  private final EventService eventService;

  public EventRestController(EventService eventService) {
    this.eventService = eventService;
  }

  @PostMapping("/createEvent")
  @PreAuthorize("hasRole('ADMIN') or hasRole('SCHEDULER')")
  public EventDTO createEvent(
    @AuthenticationPrincipal JwtUserDetails jwtUserDetails,
    @Valid @RequestBody NewEventRequestDTO newEventRequestDTO
  ) {
    log.debug("EventRestController::createEvent");
    return eventService.createEvent(jwtUserDetails, newEventRequestDTO);
  }

  @GetMapping("/allEvents")
  @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN') or hasRole('SCHEDULER')")
  public List<EventDTO> getAllEvents() {
    log.debug("EventRestController::getAllEvents");
    return eventService.getAllEvents();
  }

  @GetMapping("/getEventsInDateRange")
  @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN') or hasRole('SCHEDULER')")
  public List<EventDTO> getEventsInDateRange(@Valid @IsValidInstant @RequestParam String startDate, @Valid @IsValidInstant @RequestParam String endDate) {
    log.debug("EventRestController::getEventsInDateRange");
    return eventService.getAllEventsWithDateRange(startDate, endDate);
  }

  @PutMapping("/removeMemberFromEvent/{eventUuid}")
  @PreAuthorize("hasRole('MEMBER')")
  public EventDTO removeMemberFromEvent(
    @AuthenticationPrincipal JwtUserDetails jwtUserDetails,
    @PathVariable String eventUuid
  ) {
    log.debug("EventRestController::removeMemberFromEvent");
    return eventService.removeMemberFromEvent(jwtUserDetails, eventUuid);
  }

  @PutMapping("/joinEvent/{eventUuid}")
  @PreAuthorize("hasRole('MEMBER')")
  public EventDTO joinEvent(
    @AuthenticationPrincipal JwtUserDetails jwtUserDetails,
    @PathVariable("eventUuid") String eventUuid
  ) {
    log.debug("EventRestController::joinEvent");
    return eventService.joinEvent(jwtUserDetails, eventUuid);
  }

  @DeleteMapping("/deleteEvent/{eventUuid}")
  @PreAuthorize("hasRole('ADMIN') or (hasRole('SCHEDULER') and @eventCreatorSecurity.isCreator(#eventUuid, authentication.principal))")
  public EventDTO deleteEvent(@PathVariable String eventUuid) {
    log.debug("EventRestController::deleteEvent");
    return eventService.deleteEvent(eventUuid);
  }

  @PutMapping("/editEvent")
  @PreAuthorize("hasRole('ADMIN') or (hasRole('SCHEDULER') and @eventCreatorSecurity.isCreator(#editEventRequestDTO.eventUuid, authentication.principal))")
  public EventDTO editEvent(@Valid @RequestBody EditEventRequestDTO editEventRequestDTO) {
    log.debug("EventRestController::editEvent");
    return eventService.editEvent(editEventRequestDTO);
  }
}
