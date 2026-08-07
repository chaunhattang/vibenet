package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.DeviceErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.models.dtos.request.DeviceRegisterRequest;
import vibe.net.backend.models.dtos.response.DeviceRegisterResponse;
import vibe.net.backend.models.entities.DeviceToken;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.DeviceTokenRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.DeviceService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DeviceServiceImpl implements DeviceService {
    DeviceTokenRepository deviceTokenRepository;
    UserRepository userRepository;
    JwtServiceImpl jwtService;

    @Override
    @Transactional
    public DeviceRegisterResponse register(UUID userId, DeviceRegisterRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        // Upsert on (userId, pushToken): re-registering the same device refreshes it in place.
        DeviceToken device = deviceTokenRepository.findByUserIdAndPushToken(userId, request.getPushToken())
                .orElseGet(() -> DeviceToken.builder()
                        .user(user)
                        .pushToken(request.getPushToken())
                        .build());
        device.setPlatform(request.getPlatform());
        if (device.getWidgetToken() == null) {
            device.setWidgetToken(jwtService.createWidgetToken(user));
        }
        device = deviceTokenRepository.saveAndFlush(device);

        return DeviceRegisterResponse.builder()
                .deviceId(device.getId())
                .widgetToken(device.getWidgetToken())
                .registeredAt(device.getRegisteredAt())
                .build();
    }

    @Override
    @Transactional
    public void deregister(UUID userId, String pushToken) {
        // Deregistering a token that was never registered is a real error (likely a client bug),
        // unlike the idempotent close-friend removal.
        DeviceToken device = deviceTokenRepository.findByPushToken(pushToken)
                .orElseThrow(() -> new AppException(DeviceErrorCode.NOT_FOUND));
        deviceTokenRepository.delete(device);
    }
}
