package vibe.net.backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vibe.net.backend.models.dtos.response.ReelResponse;
import vibe.net.backend.models.entities.Reel;

import java.util.List;

@Mapper(componentModel = "spring", uses = PostMapper.class)
public interface ReelMapper {
    @Mapping(target = "likesCount", ignore = true)
    @Mapping(target = "commentsCount", ignore = true)
    @Mapping(target = "liked", ignore = true)
    @Mapping(target = "saved", ignore = true)
    ReelResponse toResponse(Reel reel);

    List<ReelResponse> toResponseList(List<Reel> reels);
}
