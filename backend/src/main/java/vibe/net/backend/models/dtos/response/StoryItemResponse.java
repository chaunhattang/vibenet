package vibe.net.backend.models.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.MediaType;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StoryItemResponse {
    UUID id;
    String mediaUrl;
    MediaType mediaType;
    String caption;
    int durationSeconds;
    LocalDateTime createdAt;
    LocalDateTime expiresAt;
    @JsonProperty("isViewed")
    boolean viewed;
    int viewersCount;
}
