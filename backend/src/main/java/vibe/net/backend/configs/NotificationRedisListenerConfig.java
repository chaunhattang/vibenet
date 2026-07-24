package vibe.net.backend.configs;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import vibe.net.backend.services.implementations.NotificationEventListener;
import vibe.net.backend.utils.RedisKeys;

@Configuration
@RequiredArgsConstructor
public class NotificationRedisListenerConfig {

    private final RedisMessageListenerContainer redisMessageListenerContainer;
    private final NotificationEventListener notificationEventListener;

    @Bean
    public ChannelTopic notificationEventsTopic() {
        ChannelTopic topic = new ChannelTopic(RedisKeys.NOTIFICATION_EVENTS_CHANNEL);
        redisMessageListenerContainer.addMessageListener(notificationEventListener, topic);
        return topic;
    }
}
