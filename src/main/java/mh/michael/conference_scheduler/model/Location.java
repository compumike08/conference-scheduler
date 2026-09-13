package mh.michael.conference_scheduler.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity(name = "location")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Location {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private UUID locationUuid;

  @Column(nullable = false, unique = true, length = 100)
  private String locationName;

  @Column(nullable = false)
  private Long capacity; // max number of attendees location can support

  @Column(length = 2000)
  private String locationDescription;

  @OneToMany(mappedBy = "location",  cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<Event> events = new HashSet<>();
}
