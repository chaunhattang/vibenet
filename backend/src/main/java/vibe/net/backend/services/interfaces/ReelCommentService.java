package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.CommentRequest;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.ReelCommentResponse;

import java.util.UUID;

@Service
public interface ReelCommentService {
    ReelCommentResponse addComment(UUID reelId, CommentRequest request);

    PageResponse<ReelCommentResponse> getCommentsByReelId(UUID reelId, int page, int size);

    void deleteComment(UUID reelId, UUID commentId);
}
