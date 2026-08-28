package mh.michael.conference_scheduler.service;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.constants.EUserRole;
import mh.michael.conference_scheduler.dto.NewUserRequestDTO;
import mh.michael.conference_scheduler.dto.UserDTO;
import mh.michael.conference_scheduler.model.User;
import mh.michael.conference_scheduler.model.UserRole;
import mh.michael.conference_scheduler.repository.UserRepository;
import mh.michael.conference_scheduler.repository.UserRoleRepository;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.util.EmailValidationUtil;
import mh.michael.conference_scheduler.util.UuidMethods;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static mh.michael.conference_scheduler.constants.Constants.INTERNAL_SERVER_ERROR_MSG;
import static mh.michael.conference_scheduler.util.ConvertDTOUtil.convertUserToUserDTO;

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
    // Validate new username is between 3 and 25 characters long
    if (username.length() < 3 || username.length() > 25) {
      String errMsg = "Username must be at between 3 and 25 characters long";
      log.debug(errMsg);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, errMsg);
    }

    if (email.isEmpty() || !EmailValidationUtil.emailPatternMatches(email)) {
      log.debug("Email '{}' is missing or invalid", email);
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is missing or invalid");
    }

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
  public UserDTO createNewUser(NewUserRequestDTO newUserRequestDTO) {
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
    return convertUserToUserDTO(savedNewUser);
  }

  @Transactional
  public UserDTO getCurrentUser(JwtUserDetails jwtUserDetails) {
    Optional<User> optUser = userRepository.findByUsername(jwtUserDetails.getUsername());

    if (optUser.isEmpty()) {
      log.error("Unable to find user with username of: {}", jwtUserDetails.getUsername());
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR_MSG);
    }

    User user = optUser.get();
    return convertUserToUserDTO(user);
  }

  @Transactional
  public UserDTO getUserByUuid(String userUuid) {
    UUID uuid = UuidMethods.handleUuidFromStringError(
      userUuid, "Invalid user UUID", HttpStatus.BAD_REQUEST
    );

    Optional<User> optUser = userRepository.findByUserUuid(uuid);

    if (optUser.isEmpty()) {
      log.error("Unable to find user with user UUID: {}", userUuid);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }

    User user = optUser.get();

    return convertUserToUserDTO(user);
  }

  @Transactional
  public UserDTO editUser(UserDTO requestDTO, JwtUserDetails jwtUserDetails) {
    validateUsernameAndEmail(requestDTO.getUsername(), requestDTO.getEmail(), jwtUserDetails);

    User user = userRepository.getOne(jwtUserDetails.getId());

    user.setUsername(requestDTO.getUsername());
    user.setEmail(requestDTO.getEmail());

    User savedUser = userRepository.save(user);
    return convertUserToUserDTO(savedUser);
  }
}
