package vibe.net.backend.models.dtos.response;

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
public class MomentCreationResponse {
    UUID momentId;
    String mediaUrl;
    MediaType mediaType;
    Integer durationSeconds;
    String caption;
    UUID replyToMomentId;
    LocalDateTime createdAt;
    int recipientCount;
}
