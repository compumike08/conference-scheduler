package mh.michael.conference_scheduler.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class NewLocationRequestDTO {
  @NotBlank(message = "Location name is required")
  @Size(min = 1, max = 100, message = "Location name must be between 1 and 100 characters long")
  private String locationName;

  @NotNull(message = "Capacity is required")
  @Positive(message = "Capacity cannot be 0 or a negative number")
  private Long capacity;

  @Size(max = 2000, message = "Location description must not be greater than 2000 characters long")
  private String locationDescription;
}
