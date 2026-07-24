package vibe.net.backend.controllers;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.request.CommentRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.CommentResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.services.interfaces.CommentService;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class CommentController {
    CommentService commentService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<CommentResponse> addComment(@PathVariable UUID postId, @RequestBody @Valid CommentRequest request) {
        return ApiResponse.<CommentResponse>builder().result(commentService.addComment(postId, request)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<CommentResponse>> getComments(
            @PathVariable UUID postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<CommentResponse>>builder()
                .result(commentService.getCommentsByPostId(postId, page, size))
                .build();
    }
}
