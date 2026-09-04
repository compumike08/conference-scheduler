package mh.michael.conference_scheduler.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;
import mh.michael.conference_scheduler.annotations.IsInstantInFuture;
import mh.michael.conference_scheduler.annotations.IsValidInstant;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class NewEventRequestDTO {
  @NotBlank(message = "Title is required")
  @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters long")
  private String title;

  @Size(min = 1, max = 2000, message = "Description must not be greater than 2000 characters long")
  private String description;

  @NotNull(message = "Max attendees is required")
  @Positive(message = "Max attendees cannot be 0 or a negative number")
  private Long maxAttendees;

  @NotBlank(message = "Start Date/Time is required")
  @IsValidInstant(message = "Start Date/Time is not formatted as an ISO 8601 date/time string")
  @IsInstantInFuture(message = "Start Date/Time must not be in the past")
  private String startDateTime;

  @NotBlank(message = "End Date/Time is required")
  @IsValidInstant(message = "End Date/Time is not formatted as an ISO 8601 date/time string")
  @IsInstantInFuture(message = "End Date/Time must not be in the past")
  private String endDateTime;
}
