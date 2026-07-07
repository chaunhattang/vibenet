package vibe.net.backend.services.interfaces;

import vibe.net.backend.models.dtos.request.LoginRequest;
import vibe.net.backend.models.dtos.request.RegisterRequest;
import vibe.net.backend.models.dtos.response.TokenResponse;

public interface AuthService {
    public RegisterRequest register(RegisterRequest request);

    public TokenResponse login(LoginRequest request);
}
