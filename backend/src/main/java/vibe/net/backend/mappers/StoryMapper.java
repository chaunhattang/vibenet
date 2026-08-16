package vibe.net.backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vibe.net.backend.models.dtos.response.StoryItemResponse;
import vibe.net.backend.models.entities.Story;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StoryMapper {
    @Mapping(target = "viewed", ignore = true)
    @Mapping(target = "viewersCount", ignore = true)
    StoryItemResponse toResponse(Story story);

    List<StoryItemResponse> toResponseList(List<Story> stories);
}
