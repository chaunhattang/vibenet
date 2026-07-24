package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.LocketErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.models.dtos.response.AddCloseFriendResponse;
import vibe.net.backend.models.dtos.response.CloseFriendResponse;
import vibe.net.backend.models.dtos.response.CloseFriendsListResponse;
import vibe.net.backend.models.entities.CloseFriend;
import vibe.net.backend.models.entities.Profile;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.CloseFriendRepository;
import vibe.net.backend.repositories.FriendshipRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.CloseFriendService;
import vibe.net.backend.utils.LocketConstants;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloseFriendServiceImpl implements CloseFriendService {
    CloseFriendRepository closeFriendRepository;
    FriendshipRepository friendshipRepository;
    UserRepository userRepository;

    @Override
    public CloseFriendsListResponse getCloseFriends(UUID ownerId) {
        List<CloseFriendResponse> closeFriends = closeFriendRepository.findByOwnerIdOrderByAddedAtDesc(ownerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return CloseFriendsListResponse.builder()
                .closeFriends(closeFriends)
                .count(closeFriends.size())
                .limit(LocketConstants.CLOSE_FRIEND_LIMIT)
                .build();
    }

    @Override
    @Transactional
    public AddCloseFriendResponse addCloseFriend(UUID ownerId, UUID friendId) {
        // Idempotent: already a close friend -> return existing (no error, no duplicate).
        var existing = closeFriendRepository.findByOwnerIdAndFriendId(ownerId, friendId);
        if (existing.isPresent()) {
            return AddCloseFriendResponse.builder()
                    .friendId(friendId)
                    .addedAt(existing.get().getAddedAt())
                    .build();
        }

        if (!friendshipRepository.areAcceptedFriends(ownerId, friendId)) {
            throw new AppException(LocketErrorCode.NOT_ACCEPTED_FRIEND);
        }

        if (closeFriendRepository.countByOwnerId(ownerId) >= LocketConstants.CLOSE_FRIEND_LIMIT) {
            throw new AppException(LocketErrorCode.CLOSE_FRIEND_LIMIT_REACHED);
        }

        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        CloseFriend closeFriend = CloseFriend.builder()
                .owner(owner)
                .friend(friend)
                .build();
        closeFriend = closeFriendRepository.save(closeFriend);

        return AddCloseFriendResponse.builder()
                .friendId(friendId)
                .addedAt(closeFriend.getAddedAt())
                .build();
    }

    @Override
    @Transactional
    public void removeCloseFriend(UUID ownerId, UUID friendId) {
        // Idempotent: removing a non-member is a 200 no-op, not a 404.
        closeFriendRepository.deleteByOwnerIdAndFriendId(ownerId, friendId);
    }

    private CloseFriendResponse toResponse(CloseFriend closeFriend) {
        User friend = closeFriend.getFriend();
        Profile profile = friend.getProfile();
        return CloseFriendResponse.builder()
                .userId(friend.getId())
                .userName(friend.getUsername())
                .fullName(profile != null ? profile.getFullName() : null)
                .avatarUrl(profile != null ? profile.getAvatarUrl() : null)
                .addedAt(closeFriend.getAddedAt())
                .build();
    }
}
