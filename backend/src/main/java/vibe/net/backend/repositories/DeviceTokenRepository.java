package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.DeviceToken;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {
    Optional<DeviceToken> findByUserIdAndPushToken(UUID userId, String pushToken);

    Optional<DeviceToken> findByPushToken(String pushToken);

    Optional<DeviceToken> findByWidgetToken(String widgetToken);

    List<DeviceToken> findByUserId(UUID userId);

    void deleteByPushToken(String pushToken);
}
