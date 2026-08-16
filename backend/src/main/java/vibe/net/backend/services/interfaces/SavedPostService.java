package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.PostResponse;

import java.util.UUID;

@Service
public interface SavedPostService {
    /**
     * @return true if the post is now saved, false if the save was removed.
     */
    boolean toggleSave(UUID postId);

    PageResponse<PostResponse> getSavedPosts(int page, int size);
}
