package mh.michael.conference_scheduler.service;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.constants.EUserRole;
import mh.michael.conference_scheduler.dto.EditRoleForUserRequestDTO;
import mh.michael.conference_scheduler.dto.NewUserRequestDTO;
import mh.michael.conference_scheduler.dto.UserWithoutMemberDTO;
import mh.michael.conference_scheduler.model.User;
import mh.michael.conference_scheduler.model.UserRole;
import mh.michael.conference_scheduler.repository.UserRepository;
import mh.michael.conference_scheduler.repository.UserRoleRepository;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.util.ConvertDTOUtil;
import mh.michael.conference_scheduler.util.UuidMethods;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

import static mh.michael.conference_scheduler.constants.Constants.INTERNAL_SERVER_ERROR_MSG;
import static mh.michael.conference_scheduler.util.ConvertDTOUtil.convertUserToUserWithoutMemberDTO;

@Service
@Slf4j
public class UserService {
  private final UserRepository userRepository;
  private final UserRoleRepository userRoleRepository;
  private final PasswordEncoder encoder;

  public UserService(
    UserRepository userRepository,
    UserRoleRepository userRoleRepository,
    PasswordEncoder encoder
  ) {
    this.userRepository = userRepository;
    this.userRoleRepository = userRoleRepository;
    this.encoder = encoder;
  }

  private void validateUsernameAndEmail(String username, String email) {
    validateUsernameAndEmail(username, email, null);
  }

  private void validateUsernameAndEmail(String username, String email, JwtUserDetails jwtUserDetails) {
    if (jwtUserDetails != null) {
      if (!jwtUserDetails.getUsername().equals(username) && userRepository.existsByUsername(username)) {
        log.debug("Username '{}' already exists", username);
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
      }

      if (!jwtUserDetails.getEmail().equals(email) && userRepository.existsByEmail(email)) {
        log.debug("Email '{}' already exists", email);
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
      }
    } else {
      if (userRepository.existsByUsername(username)) {
        log.debug("Username '{}' already exists", username);
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
      }

      if (userRepository.existsByEmail(email)) {
        log.debug("Email '{}' already exists", email);
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
      }
    }
  }

  @Transactional
  public UserWithoutMemberDTO createNewUser(NewUserRequestDTO newUserRequestDTO) {
    validateUsernameAndEmail(newUserRequestDTO.getUsername(), newUserRequestDTO.getEmail());

    User newUser = User.builder()
      .username(newUserRequestDTO.getUsername())
      .email(newUserRequestDTO.getEmail())
      .password(encoder.encode(newUserRequestDTO.getPassword()))
      .userUuid(UUID.randomUUID())
      .build();

    Set<UserRole> roles = new HashSet<>();
    Optional<UserRole> optUserUserRole = userRoleRepository.findByName(EUserRole.ROLE_USER);

    if (optUserUserRole.isEmpty()) {
      log.error("Unable to find user role with name of: {}", EUserRole.ROLE_USER.name());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    roles.add(optUserUserRole.get());

    long userCount = userRepository.count();

    // If this is the first user being created in the database, give it an ADMIN role
    if (userCount == 0L) {
      Optional<UserRole> optUserAdminRole = userRoleRepository.findByName(EUserRole.ROLE_ADMIN);

      if (optUserAdminRole.isEmpty()) {
        log.error("Unable to find user role with name of: {}", EUserRole.ROLE_ADMIN.name());
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
      }

      roles.add(optUserAdminRole.get());
    }

    newUser.setRoles(roles);

    User savedNewUser = userRepository.save(newUser);
    return convertUserToUserWithoutMemberDTO(savedNewUser);
  }

  @Transactional
  public UserWithoutMemberDTO getCurrentUser(JwtUserDetails jwtUserDetails) {
    Optional<User> optUser = userRepository.findByUsername(jwtUserDetails.getUsername());

    if (optUser.isEmpty()) {
      log.error("Unable to find user with username of: {}", jwtUserDetails.getUsername());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    User user = optUser.get();
    return convertUserToUserWithoutMemberDTO(user);
  }

  @Transactional
  public UserWithoutMemberDTO getUserByUuid(String userUuid) {
    UUID uuid = UuidMethods.handleUuidFromStringError(
      userUuid, "Invalid user UUID", HttpStatus.BAD_REQUEST
    );

    Optional<User> optUser = userRepository.findByUserUuid(uuid);

    if (optUser.isEmpty()) {
      log.error("Unable to find user with user UUID: {}", userUuid);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }

    User user = optUser.get();

    return convertUserToUserWithoutMemberDTO(user);
  }

  @Transactional
  public List<UserWithoutMemberDTO> searchUserByUsername(String searchUsername) {
    if (searchUsername == null || searchUsername.isBlank()) {
      String errMsg =  "Username is null or empty";
      log.error(errMsg);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errMsg);
    }

    List<User> matchingUsernameList = userRepository.findByUsernameContainingIgnoreCaseOrderByUsernameAsc(searchUsername);

    return matchingUsernameList.stream()
      .map(ConvertDTOUtil::convertUserToUserWithoutMemberDTO)
      .toList();
  }

  @Transactional
  public List<UserWithoutMemberDTO> searchUserByRoleName(String searchRoleName) {
    if (searchRoleName == null || searchRoleName.isBlank()) {
      String errMsg =  "Role is null or empty";
      log.error(errMsg);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errMsg);
    }

    EUserRole role;

    try {
      role = EUserRole.valueOf(searchRoleName);
    } catch (IllegalArgumentException e) {
      log.error("Invalid search role name: {}", searchRoleName, e);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
    }

    List<User> matchingUserRolesList = userRepository.findByRoles_name(role);

    return matchingUserRolesList.stream()
      .map(ConvertDTOUtil::convertUserToUserWithoutMemberDTO)
      .toList();
  }

  @Transactional
  public UserWithoutMemberDTO addRoleToUser(EditRoleForUserRequestDTO editRoleForUserRequestDTO) {
    UUID uuid = UUID.fromString(editRoleForUserRequestDTO.getUserUuid());
    String newUserRoleString = editRoleForUserRequestDTO.getRole();
    EUserRole newUserRoleEnum = EUserRole.valueOf(newUserRoleString);

    Optional<User> optUser = userRepository.findByUserUuid(uuid);

    if (optUser.isEmpty()) {
      log.error("Unable to find user with user UUID: {}", editRoleForUserRequestDTO.getUserUuid());
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }

    Optional<UserRole> optNewUserRole = userRoleRepository.findByName(newUserRoleEnum);

    if (optNewUserRole.isEmpty()) {
      log.error("Unable to find user role with name of: {}", newUserRoleEnum.name());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    User user = optUser.get();
    UserRole newUserRole = optNewUserRole.get();

    Set<UserRole> roles = user.getRoles();
    roles.add(newUserRole);
    user.setRoles(roles);

    User savedUser = userRepository.save(user);

    return convertUserToUserWithoutMemberDTO(savedUser);
  }

  @Transactional
  public UserWithoutMemberDTO removeRoleFromUser(EditRoleForUserRequestDTO editRoleForUserRequestDTO) {
    UUID uuid = UUID.fromString(editRoleForUserRequestDTO.getUserUuid());
    String userRoleToRemoveString = editRoleForUserRequestDTO.getRole();
    EUserRole userRoleToRemoveEnum = EUserRole.valueOf(userRoleToRemoveString);

    Optional<User> optUser = userRepository.findByUserUuid(uuid);

    if (optUser.isEmpty()) {
      log.error("Unable to find user with user UUID: {}", editRoleForUserRequestDTO.getUserUuid());
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }

    User user = optUser.get();

    if (!user.getRoles().stream().map(UserRole::getName).toList().contains(userRoleToRemoveEnum)) {
      log.warn("Unable to remove user role with name of '{}' from user '{}', as user does not currently have that role", userRoleToRemoveEnum.name(), user.getUserUuid());
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Unable to remove role, as the selected user does not currently have that role");
    }

    if (userRoleToRemoveEnum.equals(EUserRole.ROLE_ADMIN)) {
      Integer numOfAdmins = userRepository.countUsersByRolesName(EUserRole.ROLE_ADMIN);

      if (numOfAdmins <= 1) {
        String errMsg = "Cannot remove the admin role from the last admin user in the system";
        log.warn(errMsg);
        throw new ResponseStatusException(HttpStatus.CONFLICT, errMsg);
      }
    }

    UserRole selectedUserRole = user.getRoles().stream()
      .filter(role -> role.getName().equals(userRoleToRemoveEnum))
      .findFirst()
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG));

    user.getRoles().remove(selectedUserRole);

    User savedUser = userRepository.save(user);
    return convertUserToUserWithoutMemberDTO(savedUser);
  }
}
