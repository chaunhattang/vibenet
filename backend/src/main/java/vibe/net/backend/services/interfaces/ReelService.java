package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.ReelCreationRequest;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.ReelResponse;

import java.io.IOException;
import java.util.UUID;

@Service
public interface ReelService {
    ReelResponse uploadReel(ReelCreationRequest request) throws IOException;

    PageResponse<ReelResponse> getFeed(int page, int size);

    ReelResponse getReel(UUID reelId);

    PageResponse<ReelResponse> getUserReels(UUID userId, int page, int size);

    void deleteReel(UUID reelId);

    void incrementView(UUID reelId);

    boolean toggleSave(UUID reelId);

    long incrementShareCount(UUID reelId);
}
