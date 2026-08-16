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
public enum FollowErrorCode implements ErrorCodeInterface {
    CANNOT_FOLLOW_SELF(1, "Cannot follow yourself", HttpStatus.BAD_REQUEST),
    ALREADY_FOLLOWING(2, "Already following this user", HttpStatus.CONFLICT),
    NOT_FOLLOWING(3, "Not following this user", HttpStatus.NOT_FOUND)
    ;

    int relativeCode;
    String message;
    HttpStatusCode statusCode;

    @Override
    public ErrorDomain getDomain() {
        return ErrorDomain.FOLLOW;
    }

}
