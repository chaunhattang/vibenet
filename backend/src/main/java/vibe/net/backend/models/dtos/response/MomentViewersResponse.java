package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MomentViewersResponse {
    int viewedCount;
    int totalRecipients;
    List<MomentViewerResponse> viewers;
}
