package vibe.net.backend.controllers;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.SystemErrorCode;
import vibe.net.backend.models.dtos.request.ChangePasswordRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.UserResponse;
import vibe.net.backend.models.dtos.response.VisitorResponse;
import vibe.net.backend.services.interfaces.FollowService;
import vibe.net.backend.services.interfaces.ProfileVisitService;
import vibe.net.backend.services.interfaces.UserService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserController {
    UserService userService;
    ProfileVisitService profileVisitService;
    FollowService followService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder().result(userService.getAllUsers()).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable UUID id) {
        return ApiResponse.<UserResponse>builder().result(userService.getUserById(id)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/search")
    public ApiResponse<List<UserResponse>> searchUsers(@RequestParam String username) {
        return ApiResponse.<List<UserResponse>>builder().result(userService.searchUsersByUsername(username)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{userId}/visitors")
    public ApiResponse<PageResponse<VisitorResponse>> getVisitors(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        // You can only see your own visitors.
        if (!userId.equals(SecurityUtils.getCurrentUserId())) {
            throw new AppException(SystemErrorCode.ACCESS_DENIED);
        }
        return ApiResponse.<PageResponse<VisitorResponse>>builder()
                .result(profileVisitService.getVisitors(userId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/online")
    public ApiResponse<List<UserResponse>> getOnlineUsers() {
        return ApiResponse.<List<UserResponse>>builder().result(userService.getOnlineUsers()).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/heartbeat")
    public ApiResponse<Void> heartbeat() {
        userService.updateHeartbeat(SecurityUtils.getCurrentUserId());
        return ApiResponse.<Void>builder().message("Heartbeat updated").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        userService.changePassword(SecurityUtils.getCurrentUserId(), request);
        return ApiResponse.<Void>builder().message("Password changed").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/me")
    public ApiResponse<Void> deleteMyAccount() {
        userService.deleteUser(SecurityUtils.getCurrentUserId());
        return ApiResponse.<Void>builder().message("Account deleted").build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder().message("User deleted").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{userId}/follow")
    public ApiResponse<Map<String, Object>> follow(@PathVariable UUID userId) {
        return ApiResponse.<Map<String, Object>>builder().result(followService.follow(userId)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{userId}/follow")
    public ApiResponse<Map<String, Object>> unfollow(@PathVariable UUID userId) {
        return ApiResponse.<Map<String, Object>>builder().result(followService.unfollow(userId)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{userId}/followers")
    public ApiResponse<PageResponse<UserResponse>> getFollowers(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<UserResponse>>builder()
                .result(followService.getFollowers(userId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{userId}/following")
    public ApiResponse<PageResponse<UserResponse>> getFollowing(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<UserResponse>>builder()
                .result(followService.getFollowing(userId, page, size))
                .build();
    }
}
