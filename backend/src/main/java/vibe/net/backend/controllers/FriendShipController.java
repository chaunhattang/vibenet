package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.FriendRequestResponse;
import vibe.net.backend.models.dtos.response.FriendshipStatusResponse;
import vibe.net.backend.models.dtos.response.UserResponse;
import vibe.net.backend.services.interfaces.FriendshipService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class FriendShipController {
    FriendshipService friendshipService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{receiverId}/request")
    public ApiResponse<Void> sendFriendRequest(@PathVariable UUID receiverId) {
        friendshipService.sendFriendRequest(receiverId);
        return ApiResponse.<Void>builder().message("Friend request sent").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping("/{requestId}/accept")
    public ApiResponse<Void> acceptFriendRequest(@PathVariable UUID requestId) {
        friendshipService.acceptFriendRequest(requestId);
        return ApiResponse.<Void>builder().message("Friend request accepted").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping("/{requestId}/decline")
    public ApiResponse<Void> declineFriendRequest(@PathVariable UUID requestId) {
        friendshipService.declineFriendRequest(requestId);
        return ApiResponse.<Void>builder().message("Friend request declined").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{targetUserId}")
    public ApiResponse<Void> unfriend(@PathVariable UUID targetUserId) {
        friendshipService.unfriend(targetUserId);
        return ApiResponse.<Void>builder().message("Unfriended").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ApiResponse<List<UserResponse>> getUserFriends(@PathVariable UUID userId) {
        return ApiResponse.<List<UserResponse>>builder().result(friendshipService.getUserFriends(userId)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/requests/incoming")
    public ApiResponse<List<FriendRequestResponse>> getIncomingRequests() {
        return ApiResponse.<List<FriendRequestResponse>>builder().result(friendshipService.getIncomingList()).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{targetUserId}/status")
    public ApiResponse<FriendshipStatusResponse> checkFriendshipStatus(@PathVariable UUID targetUserId) {
        return ApiResponse.<FriendshipStatusResponse>builder()
                .result(friendshipService.checkFriendshipStatus(targetUserId))
                .build();
    }
}
