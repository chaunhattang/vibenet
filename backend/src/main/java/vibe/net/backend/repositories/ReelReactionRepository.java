package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.ReelReaction;

import java.util.Optional;
import java.util.UUID;

public interface ReelReactionRepository extends JpaRepository<ReelReaction, UUID> {
    Optional<ReelReaction> findByReelIdAndUserId(UUID reelId, UUID userId);

    long countByReelId(UUID reelId);
}
