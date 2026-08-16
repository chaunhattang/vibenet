package vibe.net.backend.models.dtos.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.enums.MediaType;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StoryCreationRequest {
    MultipartFile mediaFile;
    MediaType mediaType;
    String caption;
    Integer durationSeconds;
}
