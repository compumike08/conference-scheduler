package mh.michael.conference_scheduler.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.AddRoleToUserRequestDTO;
import mh.michael.conference_scheduler.dto.UserWithoutMemberDTO;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@Slf4j
public class UserRestController {
  private final UserService userService;

  public UserRestController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/currentUser")
  public UserWithoutMemberDTO currentUser(@AuthenticationPrincipal JwtUserDetails jwtUserDetails) {
    log.debug("UserRestController::currentUser");
    return userService.getCurrentUser(jwtUserDetails);
  }

  @GetMapping("/userUuid/{userUuid}")
  @PreAuthorize("hasRole('ADMIN')")
  public UserWithoutMemberDTO userUuid(@PathVariable String userUuid) {
    log.debug("UserRestController::userUuid");
    return userService.getUserByUuid(userUuid);
  }

  @GetMapping("/searchByUsername")
  @PreAuthorize("hasRole('ADMIN')")
  public List<UserWithoutMemberDTO> searchByUsername(@RequestParam(name = "searchUsername") String searchUsername) {
    log.debug("UserRestController::searchByUsername");
    return userService.searchUserByUsername(searchUsername);
  }

  @PutMapping("/addRole")
  @PreAuthorize("hasRole('ADMIN')")
  public UserWithoutMemberDTO addRoleToUser(@Valid @RequestBody AddRoleToUserRequestDTO addRoleToUserRequestDTO) {
    log.debug("UserRestController::addRoleToUser");
    return userService.addRoleToUser(addRoleToUserRequestDTO);
  }
}
