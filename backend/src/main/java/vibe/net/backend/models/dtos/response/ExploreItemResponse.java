package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExploreItemResponse {
    UUID id;
    String type;
    String mediaUrl;
    String thumbnailUrl;
    int likesCount;
    int commentsCount;
    ExploreAuthorResponse author;
    java.time.LocalDateTime createdAt;
}
