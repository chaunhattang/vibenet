package vibe.net.backend.models.dtos.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.Role;
import vibe.net.backend.enums.Status;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    UUID id;

    String username;

    String email;

    Role role;

    Status status;

    LocalDateTime lastActiveAt;

    ProfileResponse profileResponse;
}