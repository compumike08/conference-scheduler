package mh.michael.conference_scheduler.security;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JwtTokenRequest implements Serializable {
  @Serial
  private static final long serialVersionUID = -5580044272632709408L;

  @NotBlank(message = "Username is required")
  @Size(min = 2, max = 50, message = "Username must be between 2 and 50 characters long")
  private String username;

  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 50, message = "Password must be between 8 and 50 characters long")
  private String password;
}
