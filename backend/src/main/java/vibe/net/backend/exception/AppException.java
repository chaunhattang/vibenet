package vibe.net.backend.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppException extends RuntimeException{
    private ErrorCode errorCode;

    public AppException(ErrorCodeInterface error){
        super(error.getMessage());
        this.errorCode = ErrorCode.builder()
                .code(error.getCode())
                .message(error.getMessage())
                .statusCode(error.getStatusCode())
                .build();
    }
}