package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.CloseFriend;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CloseFriendRepository extends JpaRepository<CloseFriend, UUID> {
    List<CloseFriend> findByOwnerIdOrderByAddedAtDesc(UUID ownerId);

    Optional<CloseFriend> findByOwnerIdAndFriendId(UUID ownerId, UUID friendId);

    boolean existsByOwnerIdAndFriendId(UUID ownerId, UUID friendId);

    long countByOwnerId(UUID ownerId);

    void deleteByOwnerIdAndFriendId(UUID ownerId, UUID friendId);
}
