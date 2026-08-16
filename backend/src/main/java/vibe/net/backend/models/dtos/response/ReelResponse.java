package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReelResponse {
    UUID id;
    PostOwnerResponse creator;
    String videoUrl;
    String thumbnailUrl;
    int durationSeconds;
    String caption;
    String audioTitle;
    long viewsCount;
    int likesCount;
    int commentsCount;
    int sharesCount;
    boolean liked;
    boolean saved;
    List<String> tags;
    LocalDateTime createdAt;
}
