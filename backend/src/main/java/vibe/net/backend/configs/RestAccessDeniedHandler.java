package vibe.net.backend.configs;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import vibe.net.backend.exception.errors.SystemErrorCode;
import vibe.net.backend.models.dtos.response.ApiResponse;

import java.io.IOException;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException {
        ApiResponse<Void> body = ApiResponse.<Void>builder()
                .code(SystemErrorCode.ACCESS_DENIED.getCode())
                .message(SystemErrorCode.ACCESS_DENIED.getMessage())
                .build();
        response.setStatus(SystemErrorCode.ACCESS_DENIED.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
