package mh.michael.conference_scheduler.dto;

import lombok.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class NewUserRequestDTO {
  @NotBlank(message = "Username is required")
  @Size(min = 2, max = 50, message = "Username must be between 2 and 50 characters long")
  private String username;

  @NotBlank(message = "Email is required")
  @Size(min = 2, max = 100, message = "Email must be between 2 and 100 characters long")
  private String email;

  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters long")
  private String password;
}
