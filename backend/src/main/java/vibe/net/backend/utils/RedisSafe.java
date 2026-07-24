package vibe.net.backend.utils;

import lombok.extern.slf4j.Slf4j;

import java.util.function.Supplier;

/**
 * Runs Redis operations defensively so a Redis outage degrades gracefully instead of
 * breaking core flows. The database is always the source of truth: cache writes are
 * best-effort (swallow + log), and cache reads fall back to a supplied default (typically
 * {@code null}) which callers treat as a cache miss and rebuild from the DB.
 */
@Slf4j
public final class RedisSafe {
    private RedisSafe() {
    }

    /** Best-effort cache write: never let a Redis failure roll back a durable DB write. */
    public static void runQuietly(String op, Runnable action) {
        try {
            action.run();
        } catch (Exception e) {
            log.warn("Redis op '{}' failed; degraded (DB remains source of truth)", op, e);
        }
    }

    /** Cache read with graceful fallback: a Redis failure returns {@code fallback} (a cache miss). */
    public static <T> T getQuietly(String op, Supplier<T> action, T fallback) {
        try {
            return action.get();
        } catch (Exception e) {
            log.warn("Redis read '{}' failed; falling back to DB", op, e);
            return fallback;
        }
    }
}
