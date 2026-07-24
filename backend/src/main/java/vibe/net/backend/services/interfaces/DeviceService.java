package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.DeviceRegisterRequest;
import vibe.net.backend.models.dtos.response.DeviceRegisterResponse;

import java.util.UUID;

@Service
public interface DeviceService {
    DeviceRegisterResponse register(UUID userId, DeviceRegisterRequest request);

    void deregister(UUID userId, String pushToken);
}
