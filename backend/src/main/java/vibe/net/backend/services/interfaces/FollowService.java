package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.UserResponse;

import java.util.Map;
import java.util.UUID;

@Service
public interface FollowService {
    Map<String, Object> follow(UUID targetUserId);

    Map<String, Object> unfollow(UUID targetUserId);

    PageResponse<UserResponse> getFollowers(UUID userId, int page, int size);

    PageResponse<UserResponse> getFollowing(UUID userId, int page, int size);
}
