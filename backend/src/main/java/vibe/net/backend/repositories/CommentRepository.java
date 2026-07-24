package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.Comment;

import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    Page<Comment> findByPostIdOrderByCreatedTimeDesc(UUID postId, Pageable pageable);

    long countByPostId(UUID postId);
}
