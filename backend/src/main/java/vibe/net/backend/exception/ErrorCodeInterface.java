package vibe.net.backend.exception;

import org.springframework.http.HttpStatusCode;

public interface ErrorCodeInterface {
    int getRelativeCode();
    ErrorDomain getDomain();
    String getMessage();
    HttpStatusCode getStatusCode();

    default int getCode() {
        return getDomain().getBase() + getRelativeCode();
    }
}
