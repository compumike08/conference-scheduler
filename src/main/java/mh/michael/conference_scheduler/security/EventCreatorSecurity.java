package mh.michael.conference_scheduler.security;

import mh.michael.conference_scheduler.repository.EventRepository;
import mh.michael.conference_scheduler.util.UuidMethods;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Component("eventCreatorSecurity")
public class EventCreatorSecurity {

  private final EventRepository eventRepository;

  public EventCreatorSecurity(EventRepository eventRepository) {
    this.eventRepository = eventRepository;
  }

  @Transactional(readOnly = true)
  public boolean isCreator(String eventUuidString, Object principal) {
    UUID eventUuid = UuidMethods.handleUuidFromStringError(
      eventUuidString,
      "Event UUID invalid",
      HttpStatus.BAD_REQUEST
    );

    UUID currentUserUuid;

    if (principal instanceof JwtUserDetails) {
      currentUserUuid = ((JwtUserDetails) principal).getUserUuid();
    } else {
      return false; // Unknown principal type
    }

    return eventRepository.findByEventUuid(eventUuid)
      .map(entity -> entity.getCreatedByUser().getUserUuid().equals(currentUserUuid))
      .orElse(false);
  }
}
