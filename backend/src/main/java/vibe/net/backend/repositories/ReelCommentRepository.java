package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.ReelComment;

import java.util.UUID;

public interface ReelCommentRepository extends JpaRepository<ReelComment, UUID> {
    Page<ReelComment> findByReelIdOrderByCreatedTimeDesc(UUID reelId, Pageable pageable);

    long countByReelId(UUID reelId);
}
