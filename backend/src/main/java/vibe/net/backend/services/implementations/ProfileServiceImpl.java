package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.Gender;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.ProfileErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.ProfileMapper;
import vibe.net.backend.models.dtos.request.ProfileCreationRequest;
import vibe.net.backend.models.dtos.response.ProfileResponse;
import vibe.net.backend.models.entities.Profile;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.ProfileRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.FileService;
import vibe.net.backend.services.interfaces.ProfileService;
import vibe.net.backend.utils.SecurityUtils;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileServiceImpl implements ProfileService {
    FileService fileService;
    UserRepository userRepository;
    ProfileRepository profileRepository;
    ProfileMapper profileMapper;

    @Override
    @Transactional
    public ProfileResponse createProfile(ProfileCreationRequest request) throws IOException {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        if (profileRepository.existsById(user.getId())) {
            throw new AppException(ProfileErrorCode.EXISTED);
        }

        Profile profile = profileMapper.toEntity(request);

        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            profile.setCoverImageUrl(fileService.uploadFile(request.getCoverImage(), "cover_images"));
        }
        profile.setAvatarUrl(defaultAvatarFor(request.getGender()));
        profile.setOwner(user);

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
            userRepository.save(user);
        }

        Profile savedProfile = profileRepository.save(profile);
        return toResponseWithPhone(savedProfile, user);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(ProfileCreationRequest request) throws IOException {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Profile profile = profileRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ProfileErrorCode.NOT_FOUND));

        profile.setBio(request.getBio());
        profile.setFullName(request.getFullName());
        profile.setGender(request.getGender());
        profile.setDateOfBirth(request.getDateOfBirth());

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
            userRepository.save(user);
        }

        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            if (profile.getCoverImageUrl() != null) {
                fileService.deleteFile(profile.getCoverImageUrl());
            }
            profile.setCoverImageUrl(fileService.uploadFile(request.getCoverImage(), "cover_images"));
        }

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().contains("default")) {
                fileService.deleteFile(profile.getAvatarUrl());
            }
            profile.setAvatarUrl(fileService.uploadFile(request.getAvatar(), "avatars"));
        } else if (profile.getAvatarUrl() == null || profile.getAvatarUrl().contains("default")) {
            profile.setAvatarUrl(defaultAvatarFor(request.getGender()));
        }

        Profile savedProfile = profileRepository.save(profile);
        return toResponseWithPhone(savedProfile, user);
    }

    private String defaultAvatarFor(Gender gender) {
        if (gender == Gender.FEMALE) {
            return "/uploads/avatars/default-female-avatar.png";
        } else if (gender == Gender.MALE) {
            return "/uploads/avatars/default-male-avatar.png";
        }
        return "/uploads/avatars/default-avatar.png";
    }

    private ProfileResponse toResponseWithPhone(Profile profile, User user) {
        ProfileResponse response = profileMapper.toResponse(profile);
        response.setPhoneNumber(user.getPhoneNumber());
        return response;
    }
}
