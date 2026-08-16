package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.PostCreationRequest;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.PostResponse;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public interface PostService {
    PostResponse createPost(PostCreationRequest request) throws IOException;

    PostResponse updatePost(UUID postId, String textContent) throws IOException;

    void deletePost(UUID postId);

    PostResponse getPost(UUID postId);

    List<PostResponse> getPostsByUserId(UUID userId);

    PageResponse<PostResponse> getPostsByUserIdPage(UUID userId, int page, int size);

    PageResponse<PostResponse> getFeedPostsPage(int page, int size);

    PageResponse<PostResponse> getLikedPosts(int page, int size);

    long incrementShareCount(UUID postId);
}
