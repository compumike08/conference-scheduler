package mh.michael.conference_scheduler.controller;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.UserDTO;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@Slf4j
public class UserRestController {
  private final UserService userService;

  public UserRestController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/currentUser")
  public UserDTO currentUser(@AuthenticationPrincipal JwtUserDetails jwtUserDetails) {
    log.debug("UserRestController::currentUser");
    return userService.getCurrentUser(jwtUserDetails);
  }
}
