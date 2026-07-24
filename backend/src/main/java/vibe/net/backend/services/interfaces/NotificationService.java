package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.NotificationResponse;
import vibe.net.backend.models.dtos.response.PageResponse;

import java.util.UUID;

@Service
public interface NotificationService {
    PageResponse<NotificationResponse> getFeed(UUID userId, int page, int size);

    long getUnreadCount(UUID userId);

    void markRead(UUID userId, UUID notificationId);

    void markAllRead(UUID userId);
}
