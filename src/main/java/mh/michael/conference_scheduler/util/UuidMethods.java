package mh.michael.conference_scheduler.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@Slf4j
public class UuidMethods {
  private UuidMethods() {}

  public static UUID getUuidFromString(String inputUuid) {
    return UUID.fromString(inputUuid);
  }

  public static UUID handleUuidFromStringError(String inputUuid, String errorMessage, HttpStatus status) {
    try {
      return getUuidFromString(inputUuid);
    } catch (IllegalArgumentException e) {
      log.error("Invalid uuid format for: {}", inputUuid);
      throw new ResponseStatusException(status, errorMessage);
    }
  }
}
