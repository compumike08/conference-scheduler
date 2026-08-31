package mh.michael.conference_scheduler.dto;

import lombok.*;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ValidationErrorResponse {
  private Date timestamp;
  private Integer status;
  private String error;

  @Builder.Default
  private Map<String, String> validationErrors = new HashMap<>();
}
