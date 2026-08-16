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
public enum StoryErrorCode implements ErrorCodeInterface {
    NOT_FOUND(1, "Story not found or expired", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(2, "Not authorized to modify this story", HttpStatus.FORBIDDEN)
    ;

    int relativeCode;
    String message;
    HttpStatusCode statusCode;

    @Override
    public ErrorDomain getDomain() {
        return ErrorDomain.STORY;
    }

}
