package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.models.entities.Notification;
import vibe.net.backend.models.events.NotificationEvent;
import vibe.net.backend.repositories.NotificationRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.utils.RedisKeys;
import vibe.net.backend.utils.RedisSafe;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationPublisher {
    NotificationRepository notificationRepository;
    UserRepository userRepository;
    RedisTemplate<String, Object> redisTemplate;

    @Transactional
    public void publish(UUID recipientId, UUID actorId, NotificationType type, UUID relatedEntityId) {
        Notification notification = Notification.builder()
                .recipient(userRepository.getReferenceById(recipientId))
                .actor(userRepository.getReferenceById(actorId))
                .type(type)
                .relatedEntityId(relatedEntityId)
                .build();
        notification = notificationRepository.save(notification);

        NotificationEvent event = NotificationEvent.builder()
                .notificationId(notification.getId())
                .recipientId(recipientId)
                .actorId(actorId)
                .type(type)
                .relatedEntityId(relatedEntityId)
                .createdAt(notification.getCreatedAt())
                .build();

        // Live fan-out is best-effort: the Notification row above is the durable copy, so a
        // Redis outage must not roll back the DB write.
        RedisSafe.runQuietly("publish notification event",
                () -> redisTemplate.convertAndSend(RedisKeys.NOTIFICATION_EVENTS_CHANNEL, event));
    }
}
