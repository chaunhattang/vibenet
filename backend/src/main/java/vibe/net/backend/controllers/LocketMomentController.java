package vibe.net.backend.controllers;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.models.dtos.request.MomentReactionRequest;
import vibe.net.backend.models.dtos.response.*;
import vibe.net.backend.services.interfaces.LocketMomentService;
import vibe.net.backend.utils.SecurityUtils;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/locket/moments")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class LocketMomentController {
    LocketMomentService momentService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<MomentCreationResponse> createMoment(
            @RequestParam("media") MultipartFile media,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "recipientIds", required = false) List<UUID> recipientIds,
            @RequestParam(value = "replyToMomentId", required = false) UUID replyToMomentId
    ) throws IOException {
        return ApiResponse.<MomentCreationResponse>builder()
                .result(momentService.createMoment(media, caption, recipientIds, replyToMomentId))
                .build();
    }

    // Auth: normal JWT OR X-Widget-Token (validated in JwtAuthenticationFilter for this path only).
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/latest")
    public ApiResponse<LatestMomentResponse> getLatest() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<LatestMomentResponse>builder()
                .result(momentService.getLatest(userId))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/feed")
    public ApiResponse<PageResponse<MomentFeedItemResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<PageResponse<MomentFeedItemResponse>>builder()
                .result(momentService.getFeed(userId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/public")
    public ApiResponse<PageResponse<PublicMomentResponse>> getPublicFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID viewerId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<PageResponse<PublicMomentResponse>>builder()
                .result(momentService.getPublicFeed(viewerId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{momentId}")
    public ApiResponse<Void> deleteMoment(@PathVariable UUID momentId) {
        UUID callerId = SecurityUtils.getCurrentUserId();
        momentService.deleteMoment(momentId, callerId);
        return ApiResponse.<Void>builder().message("Moment deleted").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/sent")
    public ApiResponse<PageResponse<SentMomentResponse>> getSent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<PageResponse<SentMomentResponse>>builder()
                .result(momentService.getSent(userId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> getUnreadCount() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<Map<String, Long>>builder()
                .result(Map.of("unreadCount", momentService.unreadCount(userId)))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{momentId}/view")
    public ApiResponse<Void> viewMoment(@PathVariable UUID momentId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        momentService.viewMoment(momentId, userId);
        return ApiResponse.<Void>builder().message("Marked as viewed").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{momentId}/viewers")
    public ApiResponse<MomentViewersResponse> getViewers(@PathVariable UUID momentId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<MomentViewersResponse>builder()
                .result(momentService.getViewers(momentId, userId))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{momentId}/react")
    public ApiResponse<MomentReactionResponse> react(
            @PathVariable UUID momentId,
            @RequestBody @Valid MomentReactionRequest request
    ) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<MomentReactionResponse>builder()
                .result(momentService.react(momentId, userId, request.getEmoji()))
                .build();
    }
}
