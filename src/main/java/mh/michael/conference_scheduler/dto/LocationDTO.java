package mh.michael.conference_scheduler.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class LocationDTO {
  private String locationUuid;
  private String locationName;
  private Long capacity;
  private String locationDescription;
}
