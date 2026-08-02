package mh.michael.conference_scheduler.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class NewUserRequestDTO {
  private String username;
  private String email;
  private String password;
}
