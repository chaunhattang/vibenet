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
public enum AuthErrorCode implements ErrorCodeInterface {
    UNAUTHENTICATED(1, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_INVALID(2, "Invalid or expired refresh token", HttpStatus.UNAUTHORIZED)
    ;

    int relativeCode;
    String message;
    HttpStatusCode statusCode;
    @Override
    public ErrorDomain getDomain() {
        return ErrorDomain.AUTHENTICATION;
    }

}
