package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.Reaction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReactionRepository extends JpaRepository<Reaction, UUID> {
    Optional<Reaction> findByPostIdAndUserId(UUID postId, UUID userId);

    List<Reaction> findByUserIdAndPostIdIn(UUID userId, List<UUID> postIds);

    long countByPostId(UUID postId);

    Page<Reaction> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
