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
public enum LocketErrorCode implements ErrorCodeInterface {
    MOMENT_NOT_FOUND(1, "Moment does not exist", HttpStatus.NOT_FOUND),
    NOT_CLOSE_FRIEND(2, "User is not in your close friends list", HttpStatus.BAD_REQUEST),
    CLOSE_FRIEND_LIMIT_REACHED(3, "Close friends limit reached", HttpStatus.BAD_REQUEST),
    NOT_ACCEPTED_FRIEND(4, "Can only add accepted friends as close friends", HttpStatus.BAD_REQUEST),
    VIDEO_TOO_LONG(5, "Video exceeds 15 second limit", HttpStatus.BAD_REQUEST),
    MEDIA_TOO_LARGE(6, "Media exceeds 50MB limit", HttpStatus.BAD_REQUEST),
    INVALID_MEDIA_TYPE(7, "Unsupported media type", HttpStatus.BAD_REQUEST),
    NOT_A_RECIPIENT(8, "You are not a recipient of this moment", HttpStatus.FORBIDDEN),
    NOT_MOMENT_OWNER(9, "You can only delete your own moment", HttpStatus.FORBIDDEN)
    ;

    int relativeCode;
    String message;
    HttpStatusCode statusCode;
    @Override
    public ErrorDomain getDomain() {
        return ErrorDomain.LOCKET;
    }

}
