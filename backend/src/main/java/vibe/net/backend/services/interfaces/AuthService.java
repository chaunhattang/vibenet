package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.LoginRequest;
import vibe.net.backend.models.dtos.request.RefreshTokenRequest;
import vibe.net.backend.models.dtos.request.RegisterRequest;
import vibe.net.backend.models.dtos.response.TokenResponse;

@Service
public interface AuthService {
    RegisterRequest register(RegisterRequest request);

    TokenResponse login(LoginRequest request);

    TokenResponse refresh(RefreshTokenRequest request);
}
