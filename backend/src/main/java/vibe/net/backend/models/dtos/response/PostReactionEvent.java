package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.ReactionType;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostReactionEvent {
    UUID postId;
    int reactionCount;
    UUID actorUserId;
    ReactionType actorReaction;
}
