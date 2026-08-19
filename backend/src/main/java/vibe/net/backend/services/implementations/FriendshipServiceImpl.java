package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.FriendStatus;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.FriendshipErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.UserMapper;
import vibe.net.backend.models.dtos.response.FriendRequestResponse;
import vibe.net.backend.models.dtos.response.FriendshipStatusResponse;
import vibe.net.backend.models.dtos.response.UserResponse;
import vibe.net.backend.models.entities.Friendship;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.FriendshipRepository;
import vibe.net.backend.repositories.NotificationRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.FriendshipService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FriendshipServiceImpl implements FriendshipService {
    UserRepository userRepository;
    UserMapper userMapper;
    FriendshipRepository friendshipRepository;
    NotificationRepository notificationRepository;
    NotificationPublisher notificationPublisher;

    @Override
    @Transactional
    public void sendFriendRequest(UUID receiverId) {
        UUID senderId = SecurityUtils.getCurrentUserId();
        if (receiverId.equals(senderId)) {
            throw new AppException(FriendshipErrorCode.CANNOT_ADD_SELF);
        }

        boolean exists = friendshipRepository.existsBySenderIdAndReceiverId(senderId, receiverId)
                || friendshipRepository.existsBySenderIdAndReceiverId(receiverId, senderId);
        if (exists) {
            throw new AppException(FriendshipErrorCode.ALREADY_EXISTS);
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Friendship friendship = Friendship.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendStatus.PENDING)
                .build();
        friendship = friendshipRepository.save(friendship);

        notificationPublisher.publish(receiverId, senderId, NotificationType.FRIEND_REQUEST, friendship.getId());
    }

    @Override
    @Transactional
    public void acceptFriendRequest(UUID requestId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new AppException(FriendshipErrorCode.NOT_FOUND));

        if (!friendship.getReceiver().getId().equals(currentUserId)) {
            throw new AppException(FriendshipErrorCode.UNAUTHORIZED);
        }

        friendship.setStatus(FriendStatus.ACCEPTED);
        friendshipRepository.save(friendship);
        notificationRepository.deleteByRelatedEntityIdAndType(requestId, NotificationType.FRIEND_REQUEST);

        notificationPublisher.publish(
                friendship.getSender().getId(),
                currentUserId,
                NotificationType.FRIEND_ACCEPTED,
                friendship.getId()
        );
    }

    @Override
    @Transactional
    public void declineFriendRequest(UUID requestId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new AppException(FriendshipErrorCode.NOT_FOUND));

        if (!friendship.getReceiver().getId().equals(currentUserId)) {
            throw new AppException(FriendshipErrorCode.UNAUTHORIZED);
        }
        if (friendship.getStatus() != FriendStatus.PENDING) {
            throw new AppException(FriendshipErrorCode.INVALID_STATUS);
        }

        notificationRepository.deleteByRelatedEntityIdAndType(requestId, NotificationType.FRIEND_REQUEST);
        friendshipRepository.delete(friendship);
    }

    @Override
    public List<UserResponse> getUserFriends(UUID userId) {
        List<Friendship> friendships = friendshipRepository.findAllFriendsByUserId(userId);
        return friendships.stream()
                .map(f -> f.getSender().getId().equals(userId) ? f.getReceiver() : f.getSender())
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FriendRequestResponse> getIncomingList() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<Friendship> pending = friendshipRepository.findByReceiverIdAndStatus(currentUserId, FriendStatus.PENDING);
        return pending.stream().map(request -> {
            User requester = request.getSender();
            String fullName = requester.getUsername();
            String avatar = null;
            if (requester.getProfile() != null) {
                if (requester.getProfile().getFullName() != null) {
                    fullName = requester.getProfile().getFullName();
                }
                avatar = requester.getProfile().getAvatarUrl();
            }
            return FriendRequestResponse.builder()
                    .requestId(request.getId())
                    .requesterId(requester.getId())
                    .username(requester.getUsername())
                    .fullName(fullName)
                    .avatarUrl(avatar)
                    .createdAt(request.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void unfriend(UUID targetUserId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Friendship friendship = friendshipRepository.findFriendshipBetween(currentUserId, targetUserId)
                .orElseThrow(() -> new AppException(FriendshipErrorCode.NOT_FOUND));
        friendshipRepository.delete(friendship);
    }

    @Override
    public FriendshipStatusResponse checkFriendshipStatus(UUID targetUserId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        if (currentUserId.equals(targetUserId)) {
            return FriendshipStatusResponse.builder().status("SELF").build();
        }

        Optional<Friendship> friendshipOpt = friendshipRepository.findFriendshipBetween(currentUserId, targetUserId);
        if (friendshipOpt.isEmpty()) {
            return FriendshipStatusResponse.builder().status("NONE").build();
        }

        Friendship friendship = friendshipOpt.get();
        String status;
        if (friendship.getStatus() == FriendStatus.ACCEPTED) {
            status = "FRIENDS";
        } else {
            status = friendship.getSender().getId().equals(currentUserId) ? "PENDING_SENT" : "PENDING_RECEIVED";
        }
        return FriendshipStatusResponse.builder().status(status).friendshipId(friendship.getId()).build();
    }
}
