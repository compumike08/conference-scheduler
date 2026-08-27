package mh.michael.conference_scheduler.repository;

import mh.michael.conference_scheduler.model.Member;
import mh.michael.conference_scheduler.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
  Optional<Member> findByMemberUuid(UUID memberUuid);
  Optional<Member> findByMemberUser(User user);
  Optional<Member> findByMemberUser_Id(Long userId);
  Optional<Member> findByMemberUser_Username(String username);
  Optional<Member> findByMemberUser_UserUuid(UUID userUuid);
}
