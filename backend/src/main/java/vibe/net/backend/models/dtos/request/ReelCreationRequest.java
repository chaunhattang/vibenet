package vibe.net.backend.models.dtos.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReelCreationRequest {
    MultipartFile videoFile;
    MultipartFile thumbnailFile;
    String caption;
    String audioTitle;
    List<String> tags;
}
