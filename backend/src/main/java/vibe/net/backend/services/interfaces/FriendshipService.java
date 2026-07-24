package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.FriendRequestResponse;
import vibe.net.backend.models.dtos.response.UserResponse;

import java.util.List;
import java.util.UUID;

@Service
public interface FriendshipService {
    void sendFriendRequest(UUID receiverId);

    void acceptFriendRequest(UUID requestId);

    void declineFriendRequest(UUID requestId);

    List<UserResponse> getUserFriends(UUID userId);

    List<FriendRequestResponse> getIncomingList();

    void unfriend(UUID targetUserId);

    String checkFriendshipStatus(UUID targetUserId);
}
