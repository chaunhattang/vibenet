package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.SavedReel;

import java.util.Optional;
import java.util.UUID;

public interface SavedReelRepository extends JpaRepository<SavedReel, UUID> {
    Optional<SavedReel> findByUserIdAndReelId(UUID userId, UUID reelId);

    boolean existsByUserIdAndReelId(UUID userId, UUID reelId);

    Page<SavedReel> findByUserIdOrderBySavedAtDesc(UUID userId, Pageable pageable);
}
