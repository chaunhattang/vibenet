package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.models.dtos.response.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public interface LocketMomentService {
    MomentCreationResponse createMoment(MultipartFile media, String caption, List<UUID> recipientIds, UUID replyToMomentId) throws IOException;

    LatestMomentResponse getLatest(UUID userId);

    PageResponse<MomentFeedItemResponse> getFeed(UUID userId, int page, int size);

    PageResponse<PublicMomentResponse> getPublicFeed(UUID viewerId, int page, int size);

    void deleteMoment(UUID momentId, UUID callerId);

    PageResponse<SentMomentResponse> getSent(UUID userId, int page, int size);

    void viewMoment(UUID momentId, UUID userId);

    MomentViewersResponse getViewers(UUID momentId, UUID callerId);

    MomentReactionResponse react(UUID momentId, UUID userId, String emoji);

    long unreadCount(UUID userId);
}
