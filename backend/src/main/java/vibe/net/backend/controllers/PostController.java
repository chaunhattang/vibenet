package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.request.PostCreationRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.PostResponse;
import vibe.net.backend.services.interfaces.PostService;
import vibe.net.backend.services.interfaces.SavedPostService;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class PostController {
    PostService postService;
    SavedPostService savedPostService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<PostResponse> createPost(@ModelAttribute PostCreationRequest request) throws IOException {
        return ApiResponse.<PostResponse>builder().result(postService.createPost(request)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping("/{postId}")
    public ApiResponse<PostResponse> updatePost(@PathVariable UUID postId, @RequestParam(required = false) String textContent) throws IOException {
        return ApiResponse.<PostResponse>builder().result(postService.updatePost(postId, textContent)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable UUID postId) {
        postService.deletePost(postId);
        return ApiResponse.<Void>builder().message("Post deleted").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> getPost(@PathVariable UUID postId) {
        return ApiResponse.<PostResponse>builder().result(postService.getPost(postId)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ApiResponse<List<PostResponse>> getPostsByUserId(@PathVariable UUID userId) {
        return ApiResponse.<List<PostResponse>>builder().result(postService.getPostsByUserId(userId)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/user/{userId}/page")
    public ApiResponse<PageResponse<PostResponse>> getPostsByUserIdPage(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getPostsByUserIdPage(userId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/feed")
    public ApiResponse<PageResponse<PostResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getFeedPostsPage(page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{postId}/save")
    public ApiResponse<Map<String, Boolean>> toggleSave(@PathVariable UUID postId) {
        boolean isSaved = savedPostService.toggleSave(postId);
        return ApiResponse.<Map<String, Boolean>>builder()
                .result(Map.of("isSaved", isSaved))
                .message(isSaved ? "Post saved" : "Post unsaved")
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/saved")
    public ApiResponse<PageResponse<PostResponse>> getSavedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(savedPostService.getSavedPosts(page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/liked")
    public ApiResponse<PageResponse<PostResponse>> getLikedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<PostResponse>>builder()
                .result(postService.getLikedPosts(page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{postId}/share")
    public ApiResponse<Map<String, Long>> incrementShareCount(@PathVariable UUID postId) {
        long sharesCount = postService.incrementShareCount(postId);
        return ApiResponse.<Map<String, Long>>builder()
                .result(Map.of("sharesCount", sharesCount))
                .build();
    }
}
