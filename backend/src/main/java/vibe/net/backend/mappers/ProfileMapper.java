package vibe.net.backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vibe.net.backend.models.dtos.request.ProfileCreationRequest;
import vibe.net.backend.models.dtos.response.ProfileResponse;
import vibe.net.backend.models.entities.Profile;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "coverImageUrl", ignore = true)
    Profile toEntity(ProfileCreationRequest request);

    ProfileResponse toResponse(Profile profile);
}
