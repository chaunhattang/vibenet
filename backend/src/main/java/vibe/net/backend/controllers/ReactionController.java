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
import vibe.net.backend.services.interfaces.ReactionService;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts/{postId}/reactions")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ReactionController {
    ReactionService reactionService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping
    public ApiResponse<ReactionType> toggleReaction(@PathVariable UUID postId, @RequestParam ReactionType type) {
        ReactionType result = reactionService.toggleReaction(postId, type);
        return ApiResponse.<ReactionType>builder().result(result).message("Reaction toggled").build();
    }
}
