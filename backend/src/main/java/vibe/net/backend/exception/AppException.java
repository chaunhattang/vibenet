package vibe.net.backend.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppException extends RuntimeException{
    private ErrorCode errorCode;

    public AppException(ErrorCodeInterface error){
        super(error.getMessage());
        errorCode.setCode(error.getCode());
        errorCode.setMessage(error.getMessage());
        errorCode.setStatusCode(error.getStatusCode());
    }
}