package mh.michael.conference_scheduler.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class NewMemberRequestDTO {
  @NotBlank(message = "First name is required")
  @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters long")
  private String firstName;

  @NotBlank(message = "Last name is required")
  @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters long")
  private String lastName;
}
