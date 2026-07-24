package vibe.net.backend.models.events;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.NotificationType;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEvent implements Serializable {
    UUID notificationId;
    UUID recipientId;
    UUID actorId;
    NotificationType type;
    UUID relatedEntityId;
    LocalDateTime createdAt;
}
