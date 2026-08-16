package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.StoryView;

import java.util.UUID;

public interface StoryViewRepository extends JpaRepository<StoryView, UUID> {
    boolean existsByStoryIdAndViewerId(UUID storyId, UUID viewerId);

    long countByStoryId(UUID storyId);
}
