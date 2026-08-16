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
public class ReelCommentResponse {
    UUID id;
    UUID reelId;
    PostOwnerResponse owner;
    String content;
    LocalDateTime createdAt;
}
