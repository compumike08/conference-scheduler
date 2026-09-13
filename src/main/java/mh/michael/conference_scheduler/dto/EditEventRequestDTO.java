package mh.michael.conference_scheduler.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import mh.michael.conference_scheduler.annotations.ValidUuid;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class EditEventRequestDTO {
  @NotBlank(message = "Event UUID is required")
  @ValidUuid(message = "Event UUID is invalid")
  private String eventUuid;

  @NotBlank(message = "Title is required")
  @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters long")
  private String title;

  @Size(max = 2000, message = "Description must not be greater than 2000 characters long")
  private String description;

  @NotNull(message = "Max attendees is required")
  @Positive(message = "Max attendees cannot be 0 or a negative number")
  private Long maxAttendees;

  @NotBlank(message = "Location is required")
  @ValidUuid(message = "Invalid location UUID")
  private String locationUuid;
}
