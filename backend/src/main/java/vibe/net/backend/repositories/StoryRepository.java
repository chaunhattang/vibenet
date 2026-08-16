package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.Story;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface StoryRepository extends JpaRepository<Story, UUID> {
    List<Story> findByUserIdAndExpiresAtAfterOrderByCreatedAtAsc(UUID userId, LocalDateTime now);

    List<Story> findByUserIdInAndExpiresAtAfterOrderByCreatedAtAsc(List<UUID> userIds, LocalDateTime now);
}
