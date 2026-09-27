package mh.michael.conference_scheduler.repository;

import mh.michael.conference_scheduler.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);
  Optional<User> findByUserUuid(UUID userUuid);
  Optional<User> findByEmail(String email);
  List<User> findByUsernameContainingIgnoreCaseOrderByUsernameAsc(String partialUsername);
  Boolean existsByUsername(String username);
  Boolean existsByEmail(String email);
  long count();
}
