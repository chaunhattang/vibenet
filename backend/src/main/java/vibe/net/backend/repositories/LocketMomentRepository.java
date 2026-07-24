package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.LocketMoment;

import java.util.UUID;

public interface LocketMomentRepository extends JpaRepository<LocketMoment, UUID> {
    Page<LocketMoment> findBySenderIdOrderByCreatedAtDesc(UUID senderId, Pageable pageable);
}
