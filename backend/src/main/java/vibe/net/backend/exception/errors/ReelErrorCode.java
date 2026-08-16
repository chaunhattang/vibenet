package vibe.net.backend.exception.errors;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import vibe.net.backend.exception.ErrorCodeInterface;
import vibe.net.backend.exception.ErrorDomain;


@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ReelErrorCode implements ErrorCodeInterface {
    NOT_FOUND(1, "Reel not found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(2, "Not authorized to modify this reel", HttpStatus.FORBIDDEN),
    COMMENT_NOT_FOUND(3, "Reel comment not found", HttpStatus.NOT_FOUND),
    COMMENT_UNAUTHORIZED(4, "Not authorized to modify this comment", HttpStatus.FORBIDDEN)
    ;

    int relativeCode;
    String message;
    HttpStatusCode statusCode;

    @Override
    public ErrorDomain getDomain() {
        return ErrorDomain.REEL;
    }

}
