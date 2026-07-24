package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vibe.net.backend.enums.FriendStatus;
import vibe.net.backend.models.entities.Friendship;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {
    boolean existsBySenderIdAndReceiverId(UUID senderId, UUID receiverId);

    Optional<Friendship> findBySenderIdAndReceiverId(UUID senderId, UUID receiverId);

    List<Friendship> findByReceiverIdAndStatus(UUID receiverId, FriendStatus status);

    @Query("SELECT f FROM Friendship f WHERE (f.sender.id = :userId OR f.receiver.id = :userId) AND f.status = 'ACCEPTED'")
    List<Friendship> findAllFriendsByUserId(UUID userId);

    @Query("SELECT f FROM Friendship f WHERE (f.sender.id = :user1 AND f.receiver.id = :user2) OR (f.sender.id = :user2 AND f.receiver.id = :user1)")
    Optional<Friendship> findFriendshipBetween(UUID user1, UUID user2);

    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f " +
            "WHERE ((f.sender.id = :user1 AND f.receiver.id = :user2) OR (f.sender.id = :user2 AND f.receiver.id = :user1)) " +
            "AND f.status = 'ACCEPTED'")
    boolean areAcceptedFriends(UUID user1, UUID user2);
}
