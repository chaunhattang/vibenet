package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.StoryCreationRequest;
import vibe.net.backend.models.dtos.response.StoryItemResponse;
import vibe.net.backend.models.dtos.response.StoryUserGroupResponse;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public interface StoryService {
    StoryItemResponse uploadStory(StoryCreationRequest request) throws IOException;

    List<StoryUserGroupResponse> getFeed();

    List<StoryItemResponse> getUserStories(UUID userId);

    void markViewed(UUID storyId);

    void deleteStory(UUID storyId);
}
