package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.models.entities.Notification;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId, Pageable pageable);

    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(UUID recipientId);

    long countByRecipientIdAndIsReadFalse(UUID recipientId);

    long countByRecipientId(UUID recipientId);

    void deleteByRelatedEntityIdAndType(UUID relatedEntityId, NotificationType type);
}
