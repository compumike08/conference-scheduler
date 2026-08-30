package mh.michael.conference_scheduler.model;

import lombok.*;
import javax.persistence.*;
import java.time.Instant;
import java.util.*;

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

  @Column(nullable = false)
  private Long maxAttendees;

  private String description;

  @Column(nullable = false)
  private Instant startDateTime;

  @Column(nullable = false)
  private Instant endDateTime;

  @ManyToMany
  @JoinTable(
    name = "event_member",
    joinColumns = @JoinColumn(name = "event_id"),
    inverseJoinColumns = @JoinColumn(name = "member_id"),
    uniqueConstraints = @UniqueConstraint(
      name = "UC_event_member_unique",
      columnNames = {"event_id", "member_id"}
    )
  )
  @Builder.Default
  private Set<Member> members = new HashSet<>();

  @OneToOne
  @JoinColumn(nullable = false, name = "event_created_by_user_id")
  private User createdByUser;

  public void addMemberToEvent(Member member) {
    this.members.add(member);
    member.getEvents().add(this);
  }

  public void removeMemberFromEvent(Member member) {
    this.members.remove(member);
    member.getEvents().remove(this);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    Event event = (Event) o;
    return eventUuid.equals(event.eventUuid);
  }

  @Override
  public int hashCode() {
    return eventUuid != null ? eventUuid.hashCode() : 0;
  }
}
