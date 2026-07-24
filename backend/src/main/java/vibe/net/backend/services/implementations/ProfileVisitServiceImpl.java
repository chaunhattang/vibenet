package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.VisitorResponse;
import vibe.net.backend.models.entities.ProfileVisit;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.ProfileVisitRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.ProfileVisitService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileVisitServiceImpl implements ProfileVisitService {
    ProfileVisitRepository profileVisitRepository;
    UserRepository userRepository;

    @Override
    @Transactional
    public void logVisit(UUID profileOwnerId, UUID visitorId) {
        // Self-visits are never logged.
        if (profileOwnerId.equals(visitorId)) {
            return;
        }
        // Repeat visit UPDATES the existing row's timestamp rather than inserting a new one.
        ProfileVisit visit = profileVisitRepository.findByProfileOwnerIdAndVisitorId(profileOwnerId, visitorId)
                .orElseGet(() -> ProfileVisit.builder()
                        .profileOwner(userRepository.getReferenceById(profileOwnerId))
                        .visitor(userRepository.getReferenceById(visitorId))
                        .build());
        visit.setVisitedAt(LocalDateTime.now());
        profileVisitRepository.save(visit);
    }

    @Override
    public PageResponse<VisitorResponse> getVisitors(UUID profileOwnerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProfileVisit> visitPage = profileVisitRepository.findByProfileOwnerIdOrderByVisitedAtDesc(profileOwnerId, pageable);

        List<VisitorResponse> data = visitPage.getContent().stream().map(visit -> {
            User visitor = visit.getVisitor();
            return VisitorResponse.builder()
                    .userId(visitor.getId())
                    .userName(visitor.getUsername())
                    .avatarUrl(visitor.getProfile() != null ? visitor.getProfile().getAvatarUrl() : null)
                    .visitedAt(visit.getVisitedAt())
                    .build();
        }).collect(Collectors.toList());

        return PageResponse.<VisitorResponse>builder()
                .currentPage(page)
                .totalPages(visitPage.getTotalPages())
                .pageSize(size)
                .totalElements(visitPage.getTotalElements())
                .data(data)
                .build();
    }
}
