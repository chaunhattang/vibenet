package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.response.AddCloseFriendResponse;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.CloseFriendsListResponse;
import vibe.net.backend.services.interfaces.CloseFriendService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.UUID;

@RestController
@RequestMapping("/api/locket/close-friends")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class LocketCloseFriendController {
    CloseFriendService closeFriendService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<CloseFriendsListResponse> getCloseFriends() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<CloseFriendsListResponse>builder()
                .result(closeFriendService.getCloseFriends(userId))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{friendId}")
    public ApiResponse<AddCloseFriendResponse> addCloseFriend(@PathVariable UUID friendId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<AddCloseFriendResponse>builder()
                .result(closeFriendService.addCloseFriend(userId, friendId))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{friendId}")
    public ApiResponse<Void> removeCloseFriend(@PathVariable UUID friendId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        closeFriendService.removeCloseFriend(userId, friendId);
        return ApiResponse.<Void>builder().message("Removed from close friends").build();
    }
}
