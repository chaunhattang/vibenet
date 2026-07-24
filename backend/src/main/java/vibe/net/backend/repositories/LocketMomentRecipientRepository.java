package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.LocketMomentRecipient;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LocketMomentRecipientRepository extends JpaRepository<LocketMomentRecipient, UUID> {
    Page<LocketMomentRecipient> findByRecipientIdOrderByDeliveredAtDesc(UUID recipientId, Pageable pageable);

    Optional<LocketMomentRecipient> findTopByRecipientIdOrderByDeliveredAtDesc(UUID recipientId);

    Optional<LocketMomentRecipient> findByMomentIdAndRecipientId(UUID momentId, UUID recipientId);

    List<LocketMomentRecipient> findByMomentId(UUID momentId);

    long countByMomentId(UUID momentId);

    long countByMomentIdAndViewedAtIsNotNull(UUID momentId);

    long countByRecipientIdAndViewedAtIsNull(UUID recipientId);

    List<LocketMomentRecipient> findByRecipientIdAndViewedAtIsNull(UUID recipientId);
}
