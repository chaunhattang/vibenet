package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentResponse {
    UUID id;
    UUID postId;
    UUID parentCommentId;
    PostOwnerResponse owner;
    String content;
    int likesCount;
    boolean liked;
    LocalDateTime createdAt;
}
