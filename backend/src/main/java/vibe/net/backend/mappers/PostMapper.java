package vibe.net.backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vibe.net.backend.models.dtos.response.PostOwnerResponse;
import vibe.net.backend.models.dtos.response.PostResponse;
import vibe.net.backend.models.entities.Post;
import vibe.net.backend.models.entities.User;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PostMapper {
    @Mapping(target = "commentCount", ignore = true)
    @Mapping(target = "reactionCount", ignore = true)
    @Mapping(target = "currentReaction", ignore = true)
    @Mapping(target = "saved", ignore = true)
    PostResponse toResponse(Post post);

    List<PostResponse> toResponseList(List<Post> posts);

    @Mapping(source = "id", target = "id")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "profile.fullName", target = "fullName")
    @Mapping(source = "profile.avatarUrl", target = "avatarUrl")
    PostOwnerResponse toOwnerResponse(User user);
}
