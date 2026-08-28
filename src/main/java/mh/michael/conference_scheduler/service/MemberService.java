package mh.michael.conference_scheduler.service;

import static mh.michael.conference_scheduler.constants.Constants.INTERNAL_SERVER_ERROR_MSG;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.constants.EUserRole;
import mh.michael.conference_scheduler.dto.MemberDTO;
import mh.michael.conference_scheduler.dto.NewMemberRequestDTO;
import mh.michael.conference_scheduler.dto.UserDTO;
import mh.michael.conference_scheduler.model.Member;
import mh.michael.conference_scheduler.model.User;
import mh.michael.conference_scheduler.model.UserRole;
import mh.michael.conference_scheduler.repository.MemberRepository;
import mh.michael.conference_scheduler.repository.UserRepository;
import mh.michael.conference_scheduler.repository.UserRoleRepository;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.util.ConvertDTOUtil;
import mh.michael.conference_scheduler.util.UuidMethods;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MemberService {
  private final UserRepository userRepository;
  private final UserRoleRepository userRoleRepository;
  private final MemberRepository memberRepository;

  public MemberService(UserRepository userRepository, UserRoleRepository userRoleRepository, MemberRepository memberRepository) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.memberRepository = memberRepository;
  }

  @Transactional
  public UserDTO createMemberAndReturnUpdatedUser(NewMemberRequestDTO newMemberRequestDTO, JwtUserDetails jwtUserDetails) {
    Optional<User> optionalUser = userRepository.findByUserUuid(jwtUserDetails.getUserUuid());

    if (optionalUser.isEmpty()) {
      log.error("User with UUID of {} not found in createMemberAndReturnUpdatedUser", jwtUserDetails.getUserUuid());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    User user = optionalUser.get();

    if (user.getMember() != null) {
      String errMsg = "A member already exists for the logged in user";
      log.error(errMsg);
      throw new ResponseStatusException(HttpStatus.CONFLICT, errMsg);
    }

    Member newMember = Member.builder()
      .memberUser(user)
      .memberUuid(UUID.randomUUID())
      .firstName(newMemberRequestDTO.getFirstName())
      .lastName(newMemberRequestDTO.getLastName())
      .build();

    Member savedMember = memberRepository.save(newMember);

    user.setMember(savedMember);
    Set<UserRole> userRoles = user.getRoles();

    Optional<UserRole> optUserMemberRole = userRoleRepository.findByName(EUserRole.ROLE_MEMBER);

    if (optUserMemberRole.isEmpty()) {
      log.error("Unable to find user role with name of: {}", EUserRole.ROLE_MEMBER.name());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    userRoles.add(optUserMemberRole.get());

    User updatedUser = userRepository.save(user);

    return ConvertDTOUtil.convertUserToUserDTO(updatedUser);
  }

  @Transactional
  public List<MemberDTO> getAllMembers() {
    List<Member> members = memberRepository.findAll();
    return members.stream()
      .map(ConvertDTOUtil::convertMemberToMemberDTO)
      .collect(Collectors.toList());
  }

  @Transactional
  public MemberDTO getMemberByUuid(String memberUuid) {
    UUID uuid = UuidMethods.handleUuidFromStringError(
      memberUuid, "Invalid member UUID", HttpStatus.BAD_REQUEST
    );

    Optional<Member> optionalMember = memberRepository.findByMemberUuid(uuid);

    if (optionalMember.isEmpty()) {
      log.error("Member with UUID {} not found in getMemberByUuid", uuid);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found");
    }

    return ConvertDTOUtil.convertMemberToMemberDTO(optionalMember.get());
  }
}
