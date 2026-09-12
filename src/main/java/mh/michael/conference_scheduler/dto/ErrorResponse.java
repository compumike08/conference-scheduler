package mh.michael.conference_scheduler.dto;

import lombok.*;

import java.util.Date;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ErrorResponse {
  private Date timestamp;
  private Integer status;
  private String error;
  private String message;
}
