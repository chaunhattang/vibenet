package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vibe.net.backend.models.entities.LocketMoment;

import java.util.Collection;
import java.util.UUID;

public interface LocketMomentRepository extends JpaRepository<LocketMoment, UUID> {
    Page<LocketMoment> findBySenderIdOrderByCreatedAtDesc(UUID senderId, Pageable pageable);

    Page<LocketMoment> findBySenderIdInOrderByCreatedAtDesc(Collection<UUID> senderIds, Pageable pageable);

    @Modifying
    @Query("UPDATE LocketMoment m SET m.replyToMoment = NULL WHERE m.replyToMoment.id = :momentId")
    void clearReplyReferences(@Param("momentId") UUID momentId);
}
