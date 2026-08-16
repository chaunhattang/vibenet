package vibe.net.backend.models.dtos.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StoryUserGroupResponse {
    UUID userId;
    String username;
    String fullName;
    String avatarUrl;
    boolean hasUnseenStories;
    List<StoryItemResponse> stories;
}
