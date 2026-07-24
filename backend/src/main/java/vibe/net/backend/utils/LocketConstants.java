package vibe.net.backend.utils;

public class LocketConstants {
    private LocketConstants() {
    }

    /** Flat abuse/sanity cap on close friends — same for every user, no tiers. */
    public static final int CLOSE_FRIEND_LIMIT = 50;

    /** Max Locket video length. */
    public static final int MAX_VIDEO_SECONDS = 15;

    /** Max Locket media size (bytes) — 50MB. */
    public static final long MAX_MEDIA_BYTES = 50L * 1024 * 1024;

    /** Max caption length. */
    public static final int MAX_CAPTION_LENGTH = 280;
}
