package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.request.ReelCreationRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.ReelResponse;
import vibe.net.backend.services.interfaces.ReelService;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reels")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ReelController {
    ReelService reelService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<ReelResponse> uploadReel(@ModelAttribute ReelCreationRequest request) throws IOException {
        return ApiResponse.<ReelResponse>builder().result(reelService.uploadReel(request)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/feed")
    public ApiResponse<PageResponse<ReelResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<PageResponse<ReelResponse>>builder()
                .result(reelService.getFeed(page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{reelId}")
    public ApiResponse<ReelResponse> getReel(@PathVariable UUID reelId) {
        return ApiResponse.<ReelResponse>builder().result(reelService.getReel(reelId)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ApiResponse<PageResponse<ReelResponse>> getUserReels(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ApiResponse.<PageResponse<ReelResponse>>builder()
                .result(reelService.getUserReels(userId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{reelId}/view")
    public ApiResponse<Void> incrementView(@PathVariable UUID reelId) {
        reelService.incrementView(reelId);
        return ApiResponse.<Void>builder().message("View recorded").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{reelId}/save")
    public ApiResponse<Map<String, Boolean>> toggleSave(@PathVariable UUID reelId) {
        boolean isSaved = reelService.toggleSave(reelId);
        return ApiResponse.<Map<String, Boolean>>builder()
                .result(Map.of("isSaved", isSaved))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{reelId}")
    public ApiResponse<Void> deleteReel(@PathVariable UUID reelId) {
        reelService.deleteReel(reelId);
        return ApiResponse.<Void>builder().message("Reel deleted").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{reelId}/share")
    public ApiResponse<Map<String, Long>> incrementShareCount(@PathVariable UUID reelId) {
        long sharesCount = reelService.incrementShareCount(reelId);
        return ApiResponse.<Map<String, Long>>builder()
                .result(Map.of("sharesCount", sharesCount))
                .build();
    }
}
