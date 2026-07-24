package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.ReactionType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostResponse {
    UUID id;
    PostOwnerResponse owner;
    String textContent;
    List<String> mediaUrl;
    int commentCount;
    int reactionCount;
    ReactionType currentReaction;
    LocalDateTime createdAt;
}
