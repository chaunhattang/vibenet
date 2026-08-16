package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vibe.net.backend.enums.ReactionType;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.services.interfaces.CommentReactionService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts/comments")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class CommentReactionController {
    CommentReactionService commentReactionService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/{commentId}/reactions")
    public ApiResponse<Map<String, Object>> toggleReaction(@PathVariable UUID commentId, @RequestParam ReactionType type) {
        return ApiResponse.<Map<String, Object>>builder()
                .result(commentReactionService.toggleReaction(commentId, type))
                .message("Reaction toggled")
                .build();
    }
}
