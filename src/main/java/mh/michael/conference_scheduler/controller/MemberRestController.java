package mh.michael.conference_scheduler.controller;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.MemberDTO;
import mh.michael.conference_scheduler.dto.NewMemberRequestDTO;
import mh.michael.conference_scheduler.dto.UserDTO;
import mh.michael.conference_scheduler.security.JwtUserDetails;
import mh.michael.conference_scheduler.service.MemberService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/member")
@Slf4j
public class MemberRestController {
  private final MemberService memberService;

  public MemberRestController(MemberService memberService) {
    this.memberService = memberService;
  }

  @PostMapping("/createMemberAndReturnUpdatedUser")
  public UserDTO createMemberAndReturnUpdatedUser(
    @AuthenticationPrincipal JwtUserDetails jwtUserDetails,
    @RequestBody NewMemberRequestDTO newMemberRequestDTO
  ) {
    log.debug("MemberRestController::createMemberAndReturnUpdatedUser");
    return memberService.createMemberAndReturnUpdatedUser(newMemberRequestDTO, jwtUserDetails);
  }

  @GetMapping("/allMembers")
  public List<MemberDTO> getAllMembers() {
    log.debug("MemberRestController::getAllMembers");
    return memberService.getAllMembers();
  }
}
