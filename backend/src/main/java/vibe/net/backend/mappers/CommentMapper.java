package vibe.net.backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vibe.net.backend.models.dtos.response.CommentResponse;
import vibe.net.backend.models.entities.Comment;

import java.util.List;

@Mapper(componentModel = "spring", uses = PostMapper.class)
public interface CommentMapper {
    @Mapping(source = "post.id", target = "postId")
    @Mapping(source = "owner", target = "owner")
    @Mapping(source = "createdTime", target = "createdAt")
    CommentResponse toResponse(Comment comment);

    List<CommentResponse> toResponseList(List<Comment> comments);
}
