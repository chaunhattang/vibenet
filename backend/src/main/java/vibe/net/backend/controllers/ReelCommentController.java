package vibe.net.backend.controllers;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.request.CommentRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.ReelCommentResponse;
import vibe.net.backend.services.interfaces.ReelCommentService;

import java.util.UUID;

@RestController
@RequestMapping("/api/reels/{reelId}/comments")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ReelCommentController {
    ReelCommentService reelCommentService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<ReelCommentResponse> addComment(@PathVariable UUID reelId, @RequestBody @Valid CommentRequest request) {
        return ApiResponse.<ReelCommentResponse>builder().result(reelCommentService.addComment(reelId, request)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<ReelCommentResponse>> getComments(
            @PathVariable UUID reelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<ReelCommentResponse>>builder()
                .result(reelCommentService.getCommentsByReelId(reelId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable UUID reelId, @PathVariable UUID commentId) {
        reelCommentService.deleteComment(reelId, commentId);
        return ApiResponse.<Void>builder().message("Comment deleted").build();
    }
}
