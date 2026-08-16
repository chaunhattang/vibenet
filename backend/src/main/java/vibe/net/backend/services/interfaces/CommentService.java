package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.CommentRequest;
import vibe.net.backend.models.dtos.response.CommentResponse;
import vibe.net.backend.models.dtos.response.PageResponse;

import java.util.UUID;

@Service
public interface CommentService {
    CommentResponse addComment(UUID postId, CommentRequest request);

    PageResponse<CommentResponse> getCommentsByPostId(UUID postId, int page, int size);

    void deleteComment(UUID postId, UUID commentId);
}
