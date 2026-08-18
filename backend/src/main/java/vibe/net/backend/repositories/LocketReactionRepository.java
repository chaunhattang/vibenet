package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.LocketReaction;

import java.util.Optional;
import java.util.UUID;

public interface LocketReactionRepository extends JpaRepository<LocketReaction, UUID> {
    Optional<LocketReaction> findByMomentIdAndRecipientId(UUID momentId, UUID recipientId);

    void deleteByMomentId(UUID momentId);
}
