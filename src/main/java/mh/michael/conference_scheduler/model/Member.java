package mh.michael.conference_scheduler.model;

import lombok.*;
import javax.persistence.*;
import java.util.*;

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

  @Column(nullable = false, length = 100)
  private String lastName;

  @Column(nullable = false, length = 100)
  private String firstName;

  @OneToOne
  @JoinColumn(unique = true, name = "member_user_id")
  private User memberUser;

  @ManyToMany(mappedBy = "members")
  @Builder.Default
  private Set<Event> events = new HashSet<>();

  @PreRemove
  private void removeMemberFromEvents() {
    for (Event event : this.events) {
      event.getMembers().remove(this);
    }
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    Member member = (Member) o;
    return memberUuid.equals(member.memberUuid);
  }

  @Override
  public int hashCode() {
    return memberUuid != null ? memberUuid.hashCode() : 0;
  }
}
