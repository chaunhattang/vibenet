package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    UUID id;
    UUID actorId;
    String actorName;
    String actorAvatar;
    NotificationType type;
    UUID relatedEntityId;
    boolean isRead;
    LocalDateTime createdAt;
}
