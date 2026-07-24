package vibe.net.backend.models.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.Platform;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DeviceRegisterRequest {
    @NotNull
    Platform platform;

    @NotBlank
    String pushToken;
}
