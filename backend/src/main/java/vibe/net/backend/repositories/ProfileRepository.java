package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.Profile;

import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
}
