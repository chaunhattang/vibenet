package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.NotificationResponse;
import vibe.net.backend.services.interfaces.NotificationService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class NotificationController {
    NotificationService notificationService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<NotificationResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<PageResponse<NotificationResponse>>builder()
                .result(notificationService.getFeed(userId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<Map<String, Long>>builder()
                .result(Map.of("unreadCount", notificationService.getUnreadCount(userId)))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping("/{notificationId}/read")
    public ApiResponse<Void> markRead(@PathVariable UUID notificationId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        notificationService.markRead(userId, notificationId);
        return ApiResponse.<Void>builder().message("Marked as read").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping("/read-all")
    public ApiResponse<Void> markAllRead() {
        UUID userId = SecurityUtils.getCurrentUserId();
        notificationService.markAllRead(userId);
        return ApiResponse.<Void>builder().message("All notifications marked as read").build();
    }
}
