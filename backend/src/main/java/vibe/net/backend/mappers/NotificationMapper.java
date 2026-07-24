package vibe.net.backend.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vibe.net.backend.models.dtos.response.NotificationResponse;
import vibe.net.backend.models.entities.Notification;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(source = "actor.id", target = "actorId")
    @Mapping(source = "actor.username", target = "actorName")
    @Mapping(source = "actor.profile.avatarUrl", target = "actorAvatar")
    // Lombok names the boolean field's builder method "isRead" while the entity getter
    // resolves to property "read" — bridge them explicitly or the flag is always false.
    @Mapping(source = "read", target = "isRead")
    NotificationResponse toResponse(Notification notification);

    List<NotificationResponse> toResponseList(List<Notification> notifications);
}
