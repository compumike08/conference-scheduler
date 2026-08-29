package mh.michael.conference_scheduler.model;

import lombok.*;
import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity(name = "member")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Member {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private UUID memberUuid;

  @Column(nullable = false)
  private String lastName;

  @Column(nullable = false)
  private String firstName;

  @OneToOne
  @JoinColumn(unique = true, name = "member_user_id")
  private User memberUser;

  @ManyToMany(mappedBy = "members")
  private List<Event> events = new ArrayList<>();
}
