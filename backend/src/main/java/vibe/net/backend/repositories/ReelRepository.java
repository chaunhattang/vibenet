package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vibe.net.backend.models.entities.Reel;

import java.util.UUID;

public interface ReelRepository extends JpaRepository<Reel, UUID> {
    Page<Reel> findByCreatorId(UUID creatorId, Pageable pageable);

    Page<Reel> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("select distinct r from Reel r join r.tags t where lower(t) = lower(:tag) order by r.createdAt desc")
    Page<Reel> findByTagIgnoreCase(@Param("tag") String tag, Pageable pageable);
}
