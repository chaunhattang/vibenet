package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.StoryErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.StoryMapper;
import vibe.net.backend.models.dtos.request.StoryCreationRequest;
import vibe.net.backend.models.dtos.response.StoryItemResponse;
import vibe.net.backend.models.dtos.response.StoryUserGroupResponse;
import vibe.net.backend.models.entities.Follow;
import vibe.net.backend.models.entities.Story;
import vibe.net.backend.models.entities.StoryView;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.FollowRepository;
import vibe.net.backend.repositories.StoryRepository;
import vibe.net.backend.repositories.StoryViewRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.FileService;
import vibe.net.backend.services.interfaces.StoryService;
import vibe.net.backend.utils.SecurityUtils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StoryServiceImpl implements StoryService {
    StoryRepository storyRepository;
    StoryViewRepository storyViewRepository;
    UserRepository userRepository;
    FollowRepository followRepository;
    FileService fileService;
    StoryMapper storyMapper;

    @Override
    public StoryItemResponse uploadStory(StoryCreationRequest request) throws IOException {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        String mediaUrl = fileService.uploadFile(request.getMediaFile(), "media/stories");
        int durationSeconds = request.getDurationSeconds() != null ? request.getDurationSeconds() : 5;
        LocalDateTime now = LocalDateTime.now();

        Story story = Story.builder()
                .user(owner)
                .mediaUrl(mediaUrl)
                .mediaType(request.getMediaType())
                .caption(request.getCaption())
                .durationSeconds(durationSeconds)
                .expiresAt(now.plusHours(24))
                .build();

        Story saved = storyRepository.save(story);
        return enrich(storyMapper.toResponse(saved), currentUserId);
    }

    @Override
    public List<StoryUserGroupResponse> getFeed() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();

        List<UUID> followingIds = followRepository.findByFollowerIdOrderByCreatedAtDesc(currentUserId, org.springframework.data.domain.Pageable.unpaged())
                .getContent().stream().map(Follow::getFollowing).map(User::getId).collect(Collectors.toList());

        if (followingIds.isEmpty()) {
            return List.of();
        }

        List<Story> stories = storyRepository.findByUserIdInAndExpiresAtAfterOrderByCreatedAtAsc(followingIds, now);

        Map<UUID, List<Story>> byUser = new LinkedHashMap<>();
        for (Story story : stories) {
            byUser.computeIfAbsent(story.getUser().getId(), id -> new ArrayList<>()).add(story);
        }

        List<StoryUserGroupResponse> groups = new ArrayList<>();
        for (Map.Entry<UUID, List<Story>> entry : byUser.entrySet()) {
            List<Story> userStories = entry.getValue();
            User user = userStories.get(0).getUser();

            List<StoryItemResponse> items = userStories.stream()
                    .map(story -> enrich(storyMapper.toResponse(story), currentUserId))
                    .collect(Collectors.toList());

            boolean hasUnseen = items.stream().anyMatch(item -> !item.isViewed());

            String fullName = user.getUsername();
            String avatarUrl = null;
            if (user.getProfile() != null) {
                if (user.getProfile().getFullName() != null) {
                    fullName = user.getProfile().getFullName();
                }
                avatarUrl = user.getProfile().getAvatarUrl();
            }

            groups.add(StoryUserGroupResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .fullName(fullName)
                    .avatarUrl(avatarUrl)
                    .hasUnseenStories(hasUnseen)
                    .stories(items)
                    .build());
        }

        groups.sort((a, b) -> Boolean.compare(b.isHasUnseenStories(), a.isHasUnseenStories()));
        return groups;
    }

    @Override
    public List<StoryItemResponse> getUserStories(UUID userId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();
        List<Story> stories = storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtAsc(userId, now);
        return stories.stream()
                .map(story -> enrich(storyMapper.toResponse(story), currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markViewed(UUID storyId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new AppException(StoryErrorCode.NOT_FOUND));

        if (story.getUser().getId().equals(currentUserId)) {
            return;
        }
        if (storyViewRepository.existsByStoryIdAndViewerId(storyId, currentUserId)) {
            return;
        }

        User viewer = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        storyViewRepository.save(StoryView.builder().story(story).viewer(viewer).build());
    }

    @Override
    @Transactional
    public void deleteStory(UUID storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new AppException(StoryErrorCode.NOT_FOUND));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!story.getUser().getId().equals(currentUserId) && !isAdmin) {
            throw new AppException(StoryErrorCode.UNAUTHORIZED);
        }
        storyRepository.delete(story);
    }

    private StoryItemResponse enrich(StoryItemResponse response, UUID currentUserId) {
        response.setViewed(storyViewRepository.existsByStoryIdAndViewerId(response.getId(), currentUserId));
        response.setViewersCount((int) storyViewRepository.countByStoryId(response.getId()));
        return response;
    }
}
