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
public enum SystemErrorCode implements ErrorCodeInterface {
    UNCATEGORIZED_EXCEPTION(1, "Uncategorized exception",HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(2, "Access denied", HttpStatus.FORBIDDEN)
    ;

    int relativeCode;
    String message;
    HttpStatusCode statusCode;
    @Override
    public ErrorDomain getDomain() {
        return ErrorDomain.SYSTEM;
    }

}
