package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.FollowErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.UserMapper;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.UserResponse;
import vibe.net.backend.models.entities.Follow;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.FollowRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.FollowService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FollowServiceImpl implements FollowService {
    UserRepository userRepository;
    UserMapper userMapper;
    FollowRepository followRepository;
    NotificationPublisher notificationPublisher;

    @Override
    @Transactional
    public Map<String, Object> follow(UUID targetUserId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (targetUserId.equals(currentUserId)) {
            throw new AppException(FollowErrorCode.CANNOT_FOLLOW_SELF);
        }

        if (followRepository.existsByFollowerIdAndFollowingId(currentUserId, targetUserId)) {
            throw new AppException(FollowErrorCode.ALREADY_FOLLOWING);
        }

        User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();
        followRepository.save(follow);

        notificationPublisher.publish(targetUserId, currentUserId, NotificationType.FOLLOW, follow.getId());

        return Map.of(
                "isFollowing", true,
                "followersCount", (int) followRepository.countByFollowingId(targetUserId)
        );
    }

    @Override
    @Transactional
    public Map<String, Object> unfollow(UUID targetUserId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Follow follow = followRepository.findByFollowerIdAndFollowingId(currentUserId, targetUserId)
                .orElseThrow(() -> new AppException(FollowErrorCode.NOT_FOLLOWING));
        followRepository.delete(follow);

        return Map.of(
                "isFollowing", false,
                "followersCount", (int) followRepository.countByFollowingId(targetUserId)
        );
    }

    @Override
    public PageResponse<UserResponse> getFollowers(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Follow> followPage = followRepository.findByFollowingIdOrderByCreatedAtDesc(userId, pageable);
        return toPageResponse(followPage, Follow::getFollower, page, size);
    }

    @Override
    public PageResponse<UserResponse> getFollowing(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Follow> followPage = followRepository.findByFollowerIdOrderByCreatedAtDesc(userId, pageable);
        return toPageResponse(followPage, Follow::getFollowing, page, size);
    }

    private PageResponse<UserResponse> toPageResponse(
            Page<Follow> followPage,
            java.util.function.Function<Follow, User> userExtractor,
            int page,
            int size
    ) {
        List<UserResponse> responses = followPage.getContent().stream()
                .map(userExtractor)
                .map(userMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<UserResponse>builder()
                .currentPage(page)
                .totalPages(followPage.getTotalPages())
                .pageSize(size)
                .totalElements(followPage.getTotalElements())
                .data(responses)
                .build();
    }
}
