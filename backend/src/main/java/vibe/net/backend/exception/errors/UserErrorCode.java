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
public enum UserErrorCode implements ErrorCodeInterface {
   EXISTED(1001, "User existed", HttpStatus.CONFLICT),
    NOT_FOUND(1002, "User not found", HttpStatus.NOT_FOUND),
    ACCOUNT_BANNED(1003, "User account banned", HttpStatus.BAD_REQUEST),
   WRONG_PASSWORD(1004, "User wrong password", HttpStatus.BAD_REQUEST)
    ;

    int relativeCode;
    String message;
    HttpStatusCode statusCode;
    @Override
    public ErrorDomain getDomain() {
        return ErrorDomain.USER;
    }

}
