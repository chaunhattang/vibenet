package vibe.net.backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vibe.net.backend.models.dtos.response.ReelCommentResponse;
import vibe.net.backend.models.entities.ReelComment;

import java.util.List;

@Mapper(componentModel = "spring", uses = PostMapper.class)
public interface ReelCommentMapper {
    @Mapping(source = "reel.id", target = "reelId")
    @Mapping(source = "owner", target = "owner")
    @Mapping(source = "createdTime", target = "createdAt")
    ReelCommentResponse toResponse(ReelComment comment);

    List<ReelCommentResponse> toResponseList(List<ReelComment> comments);
}
