package vibe.net.backend.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtils {
    private SecurityUtils() {
    }

    public static UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserStr = (String) auth.getPrincipal();
        return UUID.fromString(currentUserStr);
    }
}
