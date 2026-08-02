package mh.michael.conference_scheduler.security;

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

  private String username;
  private String password;
}
