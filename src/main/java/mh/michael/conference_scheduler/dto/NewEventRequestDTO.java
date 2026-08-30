package mh.michael.conference_scheduler.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class NewEventRequestDTO {
  private String title;
  private String description;
  private Long maxAttendees;

  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant startDateTime;

  @JsonFormat(shape = JsonFormat.Shape.NUMBER)
  private Instant endDateTime;
}
