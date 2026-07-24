package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.ProfileCreationRequest;
import vibe.net.backend.models.dtos.response.ProfileResponse;

import java.io.IOException;

@Service
public interface ProfileService {
    ProfileResponse createProfile(ProfileCreationRequest request) throws IOException;

    ProfileResponse updateProfile(ProfileCreationRequest request) throws IOException;
}
