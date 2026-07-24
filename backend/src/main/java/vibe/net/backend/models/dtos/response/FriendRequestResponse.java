package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FriendRequestResponse {
    UUID requestId;
    UUID requesterId;
    String fullName;
    String username;
    String avatarUrl;
    LocalDateTime createdAt;
}
