package vibe.net.backend.controllers;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.request.DeviceRegisterRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.DeviceRegisterResponse;
import vibe.net.backend.services.interfaces.DeviceService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.UUID;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class DeviceController {
    DeviceService deviceService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping("/register")
    public ApiResponse<DeviceRegisterResponse> register(@RequestBody @Valid DeviceRegisterRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<DeviceRegisterResponse>builder()
                .result(deviceService.register(userId, request))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @DeleteMapping("/{pushToken}")
    public ApiResponse<Void> deregister(@PathVariable String pushToken) {
        UUID userId = SecurityUtils.getCurrentUserId();
        deviceService.deregister(userId, pushToken);
        return ApiResponse.<Void>builder().message("Device deregistered").build();
    }
}
