package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional <User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByUsernameContainingIgnoreCase(String username);

    List <User> findTop15ByLastActiveAtIsNotNullOrderByLastActiveAtDesc();
}
