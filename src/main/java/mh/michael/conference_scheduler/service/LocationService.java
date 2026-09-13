package mh.michael.conference_scheduler.service;

import lombok.extern.slf4j.Slf4j;
import mh.michael.conference_scheduler.dto.LocationDTO;
import mh.michael.conference_scheduler.dto.NewLocationRequestDTO;
import mh.michael.conference_scheduler.model.Location;
import mh.michael.conference_scheduler.repository.LocationRepository;
import mh.michael.conference_scheduler.util.ConvertDTOUtil;
import mh.michael.conference_scheduler.util.UuidMethods;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class LocationService {
  private final LocationRepository locationRepository;

  public LocationService(LocationRepository locationRepository) {
    this.locationRepository = locationRepository;
  }

  @Transactional
  public LocationDTO createLocation(NewLocationRequestDTO newLocationRequestDTO) {
    Optional<Location> optExistingLocation = locationRepository.findByLocationName(newLocationRequestDTO.getLocationName());

    if (optExistingLocation.isPresent()) {
      log.error("Location with name {} already exists", newLocationRequestDTO.getLocationName());
      throw new ResponseStatusException(HttpStatus.CONFLICT, "A location with the same name already exists");
    }

    Location newLocation = Location.builder()
      .locationUuid(UUID.randomUUID())
      .locationName(newLocationRequestDTO.getLocationName())
      .locationDescription(newLocationRequestDTO.getLocationDescription())
      .capacity(newLocationRequestDTO.getCapacity())
      .build();

    Location savedLocation = locationRepository.save(newLocation);

    return ConvertDTOUtil.convertLocationToLocationDTO(savedLocation);
  }

  @Transactional
  public List<LocationDTO> getAllLocations() {
    List<Location> allLocations = locationRepository.findAll();
    return allLocations.stream().map(ConvertDTOUtil::convertLocationToLocationDTO).toList();
  }

  @Transactional
  public LocationDTO deleteLocation(String locationUuidStr) {
    UUID locationUuid = UuidMethods.handleUuidFromStringError(
      locationUuidStr,
      "Location UUID invalid",
      HttpStatus.BAD_REQUEST
    );

    Optional<Location> optExistingLocation = locationRepository.findByLocationUuid(locationUuid);

    if (optExistingLocation.isEmpty()) {
      log.error("Location with UUID {} not found", locationUuid);
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
    }

    Location existingLocation = optExistingLocation.get();
    locationRepository.delete(existingLocation);

    return ConvertDTOUtil.convertLocationToLocationDTO(existingLocation);
  }
}
