package mh.michael.conference_scheduler.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity(name = "user_record")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private UUID userUuid;

  @Column(unique = true, nullable = false, length = 50)
  private String username;

  @Column(nullable = false, length = 100)
  private String email;

  @Column(nullable = false, length = 200)
  private String password;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(name = "user_user_roles",
    joinColumns = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "role_id"))
  @Builder.Default
  private Set<UserRole> roles = new HashSet<>();

  @OneToOne(mappedBy = "memberUser")
  private Member member;

  @OneToMany(mappedBy = "createdByUser")
  @Builder.Default
  private Set<Event> eventsCreated = new HashSet<>();
}
