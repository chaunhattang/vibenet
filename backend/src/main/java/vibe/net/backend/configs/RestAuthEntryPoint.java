package vibe.net.backend.configs;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import vibe.net.backend.exception.errors.AuthErrorCode;
import vibe.net.backend.models.dtos.response.ApiResponse;

import java.io.IOException;

@Component
public class RestAuthEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        ApiResponse<Void> body = ApiResponse.<Void>builder()
                .code(AuthErrorCode.UNAUTHENTICATED.getCode())
                .message(AuthErrorCode.UNAUTHENTICATED.getMessage())
                .build();
        response.setStatus(AuthErrorCode.UNAUTHENTICATED.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
