package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.request.StoryCreationRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.StoryItemResponse;
import vibe.net.backend.models.dtos.response.StoryUserGroupResponse;
import vibe.net.backend.services.interfaces.StoryService;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class StoryController {
    StoryService storyService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<StoryItemResponse> uploadStory(@ModelAttribute StoryCreationRequest request) throws IOException {
        return ApiResponse.<StoryItemResponse>builder().result(storyService.uploadStory(request)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/feed")
    public ApiResponse<List<StoryUserGroupResponse>> getFeed() {
        return ApiResponse.<List<StoryUserGroupResponse>>builder().result(storyService.getFeed()).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/user/{userId}")
    public ApiResponse<List<StoryItemResponse>> getUserStories(@PathVariable UUID userId) {
        return ApiResponse.<List<StoryItemResponse>>builder().result(storyService.getUserStories(userId)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{storyId}/view")
    public ApiResponse<Void> markViewed(@PathVariable UUID storyId) {
        storyService.markViewed(storyId);
        return ApiResponse.<Void>builder().message("Story marked as viewed").build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{storyId}")
    public ApiResponse<Void> deleteStory(@PathVariable UUID storyId) {
        storyService.deleteStory(storyId);
        return ApiResponse.<Void>builder().message("Story deleted").build();
    }
}
