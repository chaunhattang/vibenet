package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.Role;
import vibe.net.backend.enums.Status;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.AuthErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.UserMapper;
import vibe.net.backend.models.dtos.request.LoginRequest;
import vibe.net.backend.models.dtos.request.RefreshTokenRequest;
import vibe.net.backend.models.dtos.request.RegisterRequest;
import vibe.net.backend.models.dtos.response.TokenResponse;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.AuthService;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@Builder
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    JwtServiceImpl jwtService;
    SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public RegisterRequest register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername()) || userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(UserErrorCode.EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setRole(Role.USER);
        user.setStatus(Status.ACTIVE);
        user.setHashedPassword(passwordEncoder.encode(request.getPassword()));
        if (user.getProfile() != null) {
            user.getProfile().setOwner(user);
        }
        try {
            User savedUser = userRepository.save(user);
            return userMapper.toRegisterResponse(savedUser);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(UserErrorCode.EXISTED);
        }
    }

    public TokenResponse login(LoginRequest request) {
        var userOptional = userRepository.findByUsername(request.getUsername());

        if (userOptional.isEmpty()) {
            throw new AppException(UserErrorCode.NOT_FOUND);
        }
        User user = userOptional.get();
        if (user.getStatus() == Status.BANNED) {
            throw new AppException(UserErrorCode.ACCOUNT_BANNED);
        }
        if (user.getStatus() == Status.DELETED) {
            throw new AppException(UserErrorCode.NOT_FOUND);
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getHashedPassword())) {
            throw new AppException(UserErrorCode.WRONG_PASSWORD);
        }
        return createTokenResponse(user);
    }

    public TokenResponse refresh(RefreshTokenRequest request) {
        User user = validateRefreshToken(request.getRefreshToken());
        if (user == null) {
            throw new AppException(AuthErrorCode.REFRESH_TOKEN_INVALID);
        }
        return createTokenResponse(user);
    }

    private TokenResponse createTokenResponse(User user) {
        String accessToken = jwtService.createToken(user);
        String refreshToken = generateAndSetRefreshToken(user);
        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private User validateRefreshToken(String refreshToken) {
        User user = userRepository.findByRefreshToken(refreshToken).orElse(null);
        if (user == null || user.getTokenExpireTime().isBefore(LocalDateTime.now())) {
            return null;
        }
        return user;
    }

    private String generateAndSetRefreshToken(User user) {
        String refreshToken = generateRefreshTokenString();
        user.setRefreshToken(refreshToken);
        user.setTokenExpireTime(LocalDateTime.now().plusDays(1));
        userRepository.save(user);
        return refreshToken;
    }

    private String generateRefreshTokenString() {
        byte[] random = new byte[64];
        secureRandom.nextBytes(random);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(random);
    }
}
