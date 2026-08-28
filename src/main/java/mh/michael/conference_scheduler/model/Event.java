package mh.michael.conference_scheduler.model;

import lombok.*;
import javax.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity(name = "event")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Event {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private UUID eventUuid;

  @Column(nullable = false)
  private String title;

  private String description;

  @Column(nullable = false)
  private Instant startDateTime;

  @Column(nullable = false)
  private Instant endDateTime;

  @ManyToMany
  @JoinTable(
    name = "event_member",
    joinColumns = @JoinColumn(name = "event_id"),
    inverseJoinColumns = @JoinColumn(name = "member_id")
  )
  private List<Member> members;
}
