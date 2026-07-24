package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import vibe.net.backend.mappers.NotificationMapper;
import vibe.net.backend.models.dtos.response.NotificationResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.entities.Notification;
import vibe.net.backend.repositories.NotificationRepository;
import vibe.net.backend.services.interfaces.NotificationService;
import vibe.net.backend.utils.RedisKeys;
import vibe.net.backend.utils.RedisSafe;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository notificationRepository;
    NotificationMapper notificationMapper;
    RedisTemplate<String, Object> redisTemplate;

    @Override
    public PageResponse<NotificationResponse> getFeed(UUID userId, int page, int size) {
        String feedKey = RedisKeys.notificationFeed(userId);
        long start = (long) page * size;
        long end = start + size - 1;

        Set<Object> cachedIds = RedisSafe.getQuietly("noti feed read",
                () -> redisTemplate.opsForZSet().reverseRange(feedKey, start, end), null);

        if (cachedIds == null || cachedIds.isEmpty()) {
            return getFeedFromDbAndRepopulate(userId, page, size, feedKey);
        }

        List<UUID> orderedIds = cachedIds.stream()
                .map(id -> UUID.fromString((String) id))
                .toList();

        Map<UUID, Notification> byId = notificationRepository.findAllById(orderedIds).stream()
                .collect(Collectors.toMap(Notification::getId, n -> n, (a, b) -> a, LinkedHashMap::new));

        List<NotificationResponse> data = orderedIds.stream()
                .map(byId::get)
                .filter(n -> n != null)
                .map(notificationMapper::toResponse)
                .toList();

        long totalElements = notificationRepository.countByRecipientId(userId);
        int totalPages = size == 0 ? 0 : (int) Math.ceil((double) totalElements / size);

        return PageResponse.<NotificationResponse>builder()
                .currentPage(page)
                .totalPages(totalPages)
                .pageSize(size)
                .totalElements(totalElements)
                .data(data)
                .build();
    }

    private PageResponse<NotificationResponse> getFeedFromDbAndRepopulate(UUID userId, int page, int size, String feedKey) {
        Page<Notification> dbPage = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));

        if (page == 0 && !dbPage.isEmpty()) {
            Set<ZSetOperations.TypedTuple<Object>> tuples = dbPage.getContent().stream()
                    .map(n -> ZSetOperations.TypedTuple.of((Object) n.getId().toString(),
                            (double) n.getCreatedAt().toInstant(java.time.ZoneOffset.UTC).toEpochMilli()))
                    .collect(Collectors.toSet());
            RedisSafe.runQuietly("noti feed repopulate", () -> redisTemplate.opsForZSet().add(feedKey, tuples));
        }

        List<NotificationResponse> data = notificationMapper.toResponseList(dbPage.getContent());

        return PageResponse.<NotificationResponse>builder()
                .currentPage(page)
                .totalPages(dbPage.getTotalPages())
                .pageSize(size)
                .totalElements(dbPage.getTotalElements())
                .data(data)
                .build();
    }

    @Override
    public long getUnreadCount(UUID userId) {
        String counterKey = RedisKeys.unreadNotificationCount(userId);
        Object cached = RedisSafe.getQuietly("unread noti count read",
                () -> redisTemplate.opsForValue().get(counterKey), null);

        if (cached != null) {
            return Long.parseLong(cached.toString());
        }

        long dbCount = notificationRepository.countByRecipientIdAndIsReadFalse(userId);
        RedisSafe.runQuietly("unread noti count seed",
                () -> redisTemplate.opsForValue().set(counterKey, String.valueOf(dbCount)));
        return dbCount;
    }

    @Override
    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (!n.getRecipient().getId().equals(userId)) {
                return;
            }
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
                RedisSafe.runQuietly("unread noti count decrement",
                        () -> redisTemplate.opsForValue().decrement(RedisKeys.unreadNotificationCount(userId)));
            }
        });
    }

    @Override
    @Transactional
    public void markAllRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        RedisSafe.runQuietly("unread noti count reset",
                () -> redisTemplate.opsForValue().set(RedisKeys.unreadNotificationCount(userId), "0"));
    }
}
