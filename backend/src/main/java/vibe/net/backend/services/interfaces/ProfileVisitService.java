package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.VisitorResponse;

import java.util.UUID;

@Service
public interface ProfileVisitService {
    void logVisit(UUID profileOwnerId, UUID visitorId);

    PageResponse<VisitorResponse> getVisitors(UUID profileOwnerId, int page, int size);
}
