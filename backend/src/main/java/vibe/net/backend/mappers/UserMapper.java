package vibe.net.backend.mappers;

import org.mapstruct.*;
import vibe.net.backend.models.dtos.request.RegisterRequest;
import vibe.net.backend.models.dtos.response.UserResponse;
import vibe.net.backend.models.entities.Profile;
import vibe.net.backend.models.entities.User;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "hashedPassword", ignore = true)
    @Mapping(target = "profile", ignore = true)
    User toUser(RegisterRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    Profile toProfile(RegisterRequest request);

    @Mapping(source = "profile", target = "profileResponse")
    UserResponse toResponse(User user);

    RegisterRequest toRegisterResponse(User user);

    List<UserResponse> toListResponse(List<User> users);
}
