package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.AddCloseFriendResponse;
import vibe.net.backend.models.dtos.response.CloseFriendsListResponse;

import java.util.UUID;

@Service
public interface CloseFriendService {
    CloseFriendsListResponse getCloseFriends(UUID ownerId);

    AddCloseFriendResponse addCloseFriend(UUID ownerId, UUID friendId);

    void removeCloseFriend(UUID ownerId, UUID friendId);
}
