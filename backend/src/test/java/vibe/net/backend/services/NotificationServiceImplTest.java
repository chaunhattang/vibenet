package vibe.net.backend.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import vibe.net.backend.mappers.NotificationMapper;
import vibe.net.backend.models.entities.Notification;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.NotificationRepository;
import vibe.net.backend.services.implementations.NotificationServiceImpl;
import vibe.net.backend.utils.RedisKeys;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock NotificationRepository notificationRepository;
    @Mock NotificationMapper notificationMapper;
    @Mock RedisTemplate<String, Object> redisTemplate;
    @Mock ValueOperations<String, Object> valueOps;

    private NotificationServiceImpl service;

    private final UUID userId = UUID.randomUUID();

    private NotificationServiceImpl service() {
        // Manual construction so field order changes don't silently break @InjectMocks.
        return new NotificationServiceImpl(notificationRepository, notificationMapper, redisTemplate);
    }

    @Test
    void getUnreadCount_usesCounterWhenPresent() {
        service = service();
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get(RedisKeys.unreadNotificationCount(userId))).thenReturn("7");

        assertThat(service.getUnreadCount(userId)).isEqualTo(7L);
        verify(notificationRepository, never()).countByRecipientIdAndIsReadFalse(any());
    }

    @Test
    void getUnreadCount_rebuildsFromDbOnCacheMiss() {
        service = service();
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get(RedisKeys.unreadNotificationCount(userId))).thenReturn(null);
        when(notificationRepository.countByRecipientIdAndIsReadFalse(userId)).thenReturn(4L);

        assertThat(service.getUnreadCount(userId)).isEqualTo(4L);
        // Rebuilt value is written back to Redis so subsequent reads are O(1).
        verify(valueOps).set(RedisKeys.unreadNotificationCount(userId), "4");
    }

    @Test
    void markRead_decrementsCounterAndPersists() {
        service = service();
        UUID notificationId = UUID.randomUUID();
        Notification notification = Notification.builder()
                .id(notificationId)
                .recipient(User.builder().id(userId).build())
                .isRead(false)
                .build();
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(redisTemplate.opsForValue()).thenReturn(valueOps);

        service.markRead(userId, notificationId);

        assertThat(notification.isRead()).isTrue();
        verify(notificationRepository).save(notification);
        verify(valueOps).decrement(RedisKeys.unreadNotificationCount(userId));
    }

    @Test
    void markRead_ignoresNotificationOwnedByAnotherUser() {
        service = service();
        UUID notificationId = UUID.randomUUID();
        Notification notification = Notification.builder()
                .id(notificationId)
                .recipient(User.builder().id(UUID.randomUUID()).build())
                .isRead(false)
                .build();
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));

        service.markRead(userId, notificationId);

        assertThat(notification.isRead()).isFalse();
        verify(notificationRepository, never()).save(any());
    }
}
