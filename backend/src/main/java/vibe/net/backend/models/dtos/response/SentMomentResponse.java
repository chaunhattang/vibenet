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
public class SentMomentResponse {
    UUID momentId;
    String mediaUrl;
    MediaType mediaType;
    String caption;
    LocalDateTime createdAt;
    int recipientCount;
    int viewedCount;
}
