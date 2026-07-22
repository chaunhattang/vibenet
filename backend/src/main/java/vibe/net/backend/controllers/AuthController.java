package vibe.net.backend.controllers;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vibe.net.backend.models.dtos.request.LoginRequest;
import vibe.net.backend.models.dtos.request.RegisterRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.TokenResponse;
import vibe.net.backend.services.interfaces.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AuthController {
    AuthService authService;

    @PostMapping(value = "/register")
    public ApiResponse<RegisterRequest> register(@RequestBody @Valid RegisterRequest request){
        return ApiResponse.<RegisterRequest>builder().result(authService.register(request)).message("Account created").build();
    }

    @PostMapping(value = "/login")
    public ApiResponse<TokenResponse> login(@RequestBody @Valid LoginRequest request){
        return ApiResponse.<TokenResponse>builder().result(authService.login(request)).build();
    }
}
