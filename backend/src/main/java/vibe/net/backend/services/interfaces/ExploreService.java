package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.ExploreItemResponse;
import vibe.net.backend.models.dtos.response.PageResponse;

@Service
public interface ExploreService {
    PageResponse<ExploreItemResponse> getGrid(String category, int page, int size);
}
