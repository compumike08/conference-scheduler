package mh.michael.conference_scheduler.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.LocationDTO;
import mh.michael.conference_scheduler.dto.NewLocationRequestDTO;
import mh.michael.conference_scheduler.service.LocationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/location")
@Slf4j
public class LocationRestController {
  private final LocationService locationService;

  public LocationRestController(LocationService locationService) {
    this.locationService = locationService;
  }

  @PostMapping("/createLocation")
  @PreAuthorize("hasRole('ADMIN')")
  public LocationDTO createLocation(@Valid @RequestBody NewLocationRequestDTO newLocationRequestDTO) {
    log.debug("LocationRestController::createLocation");
    return locationService.createLocation(newLocationRequestDTO);
  }

  @GetMapping("/allLocations")
  public List<LocationDTO> getAllLocations() {
    log.debug("LocationRestController::getAllLocations");
    return locationService.getAllLocations();
  }

  @DeleteMapping("/deleteLocation/{locationUuid}")
  @PreAuthorize("hasRole('ADMIN')")
  public LocationDTO deleteLocation(@PathVariable("locationUuid") String locationUuid) {
    log.debug("LocationRestController::deleteLocation");
    return locationService.deleteLocation(locationUuid);
  }

}
