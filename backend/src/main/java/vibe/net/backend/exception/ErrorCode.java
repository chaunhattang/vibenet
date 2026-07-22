package vibe.net.backend.exception;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatusCode;

@Data
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ErrorCode {
    int code;
    String message;
    HttpStatusCode statusCode;
}