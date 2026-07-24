package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.ChangePasswordRequest;
import vibe.net.backend.models.dtos.response.UserResponse;

import java.util.List;
import java.util.UUID;

@Service
public interface UserService {
    List<UserResponse> getAllUsers();

    UserResponse getUserById(UUID id);

    void updateHeartbeat(UUID id);

    void deleteUser(UUID id);

    void changePassword(UUID userId, ChangePasswordRequest request);

    List<UserResponse> searchUsersByUsername(String username);

    List<UserResponse> getOnlineUsers();
}
