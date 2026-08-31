package mh.michael.conference_scheduler.repository;

import mh.michael.conference_scheduler.model.Event;
import mh.michael.conference_scheduler.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
  Optional<Event> findByEventUuid(UUID eventUuid);

  @Query("SELECT COUNT(e) > 0 FROM event e WHERE e.startDateTime < :newEnd AND e.endDateTime > :newStart AND :currentMember MEMBER OF e.members")
  boolean existsOverlappingForMember(
    @Param("newStart") Instant startDateTime,
    @Param("newEnd") Instant endDateTime,
    @Param("currentMember") Member currentMember
  );
}
