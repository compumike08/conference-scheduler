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
public class JwtTokenResponse implements Serializable {
  @Serial
  private static final long serialVersionUID = 9058760437300668823L;

  private String token;
}
