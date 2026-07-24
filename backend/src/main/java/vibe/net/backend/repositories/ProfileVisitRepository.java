package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.ProfileVisit;

import java.util.Optional;
import java.util.UUID;

public interface ProfileVisitRepository extends JpaRepository<ProfileVisit, UUID> {
    Optional<ProfileVisit> findByProfileOwnerIdAndVisitorId(UUID profileOwnerId, UUID visitorId);

    Page<ProfileVisit> findByProfileOwnerIdOrderByVisitedAtDesc(UUID profileOwnerId, Pageable pageable);
}
