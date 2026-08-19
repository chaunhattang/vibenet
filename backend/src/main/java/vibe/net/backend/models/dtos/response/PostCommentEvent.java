package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostCommentEvent {
    UUID postId;
    int commentCount;
    CommentResponse comment;
}
