package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vibe.net.backend.models.dtos.request.ProfileCreationRequest;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.ProfileResponse;
import vibe.net.backend.services.interfaces.ProfileService;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ProfileController {
    ProfileService profileService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PostMapping(consumes = "multipart/form-data")
    public ApiResponse<ProfileResponse> createProfile(@ModelAttribute ProfileCreationRequest request) throws IOException {
        return ApiResponse.<ProfileResponse>builder().result(profileService.createProfile(request)).build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @PutMapping(consumes = "multipart/form-data")
    public ApiResponse<ProfileResponse> updateProfile(@ModelAttribute ProfileCreationRequest request) throws IOException {
        return ApiResponse.<ProfileResponse>builder().result(profileService.updateProfile(request)).build();
    }
}
