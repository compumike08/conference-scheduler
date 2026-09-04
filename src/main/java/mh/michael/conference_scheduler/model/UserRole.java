package mh.michael.conference_scheduler.model;

import jakarta.persistence.*;
import lombok.*;
import mh.michael.conference_scheduler.constants.EUserRole;

@Entity(name = "user_role")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserRole {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  private EUserRole name;
}
