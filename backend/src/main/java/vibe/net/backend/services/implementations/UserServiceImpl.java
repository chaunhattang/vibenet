package vibe.net.backend.services.implementations;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.Status;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.UserMapper;
import vibe.net.backend.models.dtos.request.ChangePasswordRequest;
import vibe.net.backend.models.dtos.response.UserResponse;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.ProfileVisitService;
import vibe.net.backend.services.interfaces.UserService;
import vibe.net.backend.utils.SecurityUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    ProfileVisitService profileVisitService;

    @Override
    public List<UserResponse> getAllUsers() {
        return userMapper.toListResponse(userRepository.findAll());
    }

    @Override
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        // Log the profile visit as a side effect (self-visits are ignored inside the service).
        profileVisitService.logVisit(id, SecurityUtils.getCurrentUserId());
        return userMapper.toResponse(user);
    }

    @Override
    public void updateHeartbeat(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        user.setLastActiveAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        if (user.getStatus() == Status.DELETED) {
            throw new AppException(UserErrorCode.NOT_FOUND);
        }
        user.setStatus(Status.DELETED);
        userRepository.save(user);
    }

    @Override
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getHashedPassword())) {
            throw new AppException(UserErrorCode.WRONG_PASSWORD);
        }
        user.setHashedPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public List<UserResponse> searchUsersByUsername(String username) {
        if (username == null || username.isBlank()) {
            return List.of();
        }
        return userMapper.toListResponse(userRepository.findByUsernameContainingIgnoreCase(username.trim()));
    }

    @Override
    public List<UserResponse> getOnlineUsers() {
        return userMapper.toListResponse(userRepository.findTop15ByLastActiveAtIsNotNullOrderByLastActiveAtDesc());
    }
}
