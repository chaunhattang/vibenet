package vibe.net.backend.utils;

import java.util.UUID;

public class RedisKeys {
    private RedisKeys() {
    }

    public static final String NOTIFICATION_EVENTS_CHANNEL = "noti:events";

    public static String notificationFeed(UUID userId) {
        return "user:noti:" + userId;
    }

    public static String unreadNotificationCount(UUID userId) {
        return "user:unread_noti_count:" + userId;
    }

    public static String unreadMoments(UUID userId) {
        return "user:unread_moments:" + userId;
    }

    public static String latestMoment(UUID userId) {
        return "locket:latest:" + userId;
    }

    public static String locketFeed(UUID userId) {
        return "locket:feed:" + userId;
    }
}
