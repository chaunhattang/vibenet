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
public enum FriendshipErrorCode implements ErrorCodeInterface {
    NOT_FOUND(1, "Friendship not found", HttpStatus.NOT_FOUND),
    ALREADY_EXISTS(2, "Friendship already exists", HttpStatus.CONFLICT),
    CANNOT_ADD_SELF(3, "Cannot send a friend request to yourself", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(4, "Not authorized to act on this friend request", HttpStatus.FORBIDDEN),
    INVALID_STATUS(5, "Friend request is not in a valid state for this action", HttpStatus.BAD_REQUEST)
    ;

    int relativeCode;
    String message;
    HttpStatusCode statusCode;
    @Override
    public ErrorDomain getDomain() {
        return ErrorDomain.FRIENDSHIP;
    }

}
