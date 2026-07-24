package vibe.net.backend.services.implementations;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import vibe.net.backend.models.events.NotificationEvent;
import vibe.net.backend.utils.RedisKeys;

import java.time.ZoneOffset;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationEventListener implements MessageListener {

    private static final long MAX_FEED_SIZE = 100;

    RedisTemplate<String, Object> redisTemplate;
    SimpMessagingTemplate messagingTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        RedisSerializer<Object> valueSerializer = (RedisSerializer<Object>) redisTemplate.getValueSerializer();
        Object payload = valueSerializer.deserialize(message.getBody());
        if (!(payload instanceof NotificationEvent event)) {
            return;
        }

        double score = event.getCreatedAt().toInstant(ZoneOffset.UTC).toEpochMilli();
        String feedKey = RedisKeys.notificationFeed(event.getRecipientId());

        redisTemplate.opsForZSet().add(feedKey, event.getNotificationId().toString(), score);
        redisTemplate.opsForZSet().removeRange(feedKey, 0, -(MAX_FEED_SIZE + 1));
        redisTemplate.opsForValue().increment(RedisKeys.unreadNotificationCount(event.getRecipientId()));

        try {
            messagingTemplate.convertAndSendToUser(
                    event.getRecipientId().toString(),
                    "/queue/notifications",
                    event
            );
        } catch (Exception e) {
            log.warn("Failed to push notification {} over WebSocket to user {}", event.getNotificationId(), event.getRecipientId(), e);
        }
    }
}
