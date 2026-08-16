package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.ReelErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.ReelMapper;
import vibe.net.backend.models.dtos.request.ReelCreationRequest;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.ReelResponse;
import vibe.net.backend.models.entities.Reel;
import vibe.net.backend.models.entities.SavedReel;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.ReelCommentRepository;
import vibe.net.backend.repositories.ReelReactionRepository;
import vibe.net.backend.repositories.ReelRepository;
import vibe.net.backend.repositories.SavedReelRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.FileService;
import vibe.net.backend.services.interfaces.ReelService;
import vibe.net.backend.utils.SecurityUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReelServiceImpl implements ReelService {
    ReelRepository reelRepository;
    UserRepository userRepository;
    FileService fileService;
    ReelMapper reelMapper;
    ReelReactionRepository reelReactionRepository;
    ReelCommentRepository reelCommentRepository;
    SavedReelRepository savedReelRepository;

    @Override
    public ReelResponse uploadReel(ReelCreationRequest request) throws IOException {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        User owner = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        MultipartFile videoFile = request.getVideoFile();
        String videoUrl = fileService.uploadFile(videoFile, "media/reels");
        String thumbnailUrl = null;
        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            thumbnailUrl = fileService.uploadFile(request.getThumbnailFile(), "media/reels/thumbnails");
        }

        String audioTitle = request.getAudioTitle();
        if (audioTitle == null || audioTitle.isBlank()) {
            audioTitle = "Original Audio - " + owner.getUsername();
        }

        Reel reel = Reel.builder()
                .creator(owner)
                .videoUrl(videoUrl)
                .thumbnailUrl(thumbnailUrl)
                .caption(request.getCaption())
                .audioTitle(audioTitle)
                .tags(request.getTags() != null ? new ArrayList<>(request.getTags()) : new ArrayList<>())
                .build();

        Reel saved = reelRepository.save(reel);
        return enrich(reelMapper.toResponse(saved), currentUserId);
    }

    @Override
    public PageResponse<ReelResponse> getFeed(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Reel> reelPage = reelRepository.findAllByOrderByCreatedAtDesc(pageable);
        return toPageResponse(reelPage, page, size);
    }

    @Override
    public ReelResponse getReel(UUID reelId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new AppException(ReelErrorCode.NOT_FOUND));
        return enrich(reelMapper.toResponse(reel), SecurityUtils.getCurrentUserId());
    }

    @Override
    public PageResponse<ReelResponse> getUserReels(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Reel> reelPage = reelRepository.findByCreatorId(userId, pageable);
        return toPageResponse(reelPage, page, size);
    }

    @Override
    @Transactional
    public void deleteReel(UUID reelId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new AppException(ReelErrorCode.NOT_FOUND));

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!reel.getCreator().getId().equals(currentUserId) && !isAdmin) {
            throw new AppException(ReelErrorCode.UNAUTHORIZED);
        }
        reelRepository.delete(reel);
    }

    @Override
    @Transactional
    public void incrementView(UUID reelId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new AppException(ReelErrorCode.NOT_FOUND));
        reel.setViewsCount(reel.getViewsCount() + 1);
        reelRepository.save(reel);
    }

    @Override
    @Transactional
    public boolean toggleSave(UUID reelId) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new AppException(ReelErrorCode.NOT_FOUND));

        var existing = savedReelRepository.findByUserIdAndReelId(currentUserId, reelId);
        if (existing.isPresent()) {
            savedReelRepository.delete(existing.get());
            return false;
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        savedReelRepository.save(SavedReel.builder().user(user).reel(reel).build());
        return true;
    }

    private PageResponse<ReelResponse> toPageResponse(Page<Reel> reelPage, int page, int size) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        List<ReelResponse> responses = reelPage.getContent().stream()
                .map(reelMapper::toResponse)
                .map(response -> enrich(response, currentUserId))
                .collect(Collectors.toList());

        return PageResponse.<ReelResponse>builder()
                .currentPage(page)
                .totalPages(reelPage.getTotalPages())
                .pageSize(size)
                .totalElements(reelPage.getTotalElements())
                .data(responses)
                .build();
    }

    @Override
    @Transactional
    public long incrementShareCount(UUID reelId) {
        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new AppException(ReelErrorCode.NOT_FOUND));
        reel.setSharesCount(reel.getSharesCount() + 1);
        reelRepository.save(reel);
        return reel.getSharesCount();
    }

    private ReelResponse enrich(ReelResponse response, UUID currentUserId) {
        response.setLikesCount((int) reelReactionRepository.countByReelId(response.getId()));
        response.setCommentsCount((int) reelCommentRepository.countByReelId(response.getId()));
        response.setLiked(reelReactionRepository.findByReelIdAndUserId(response.getId(), currentUserId).isPresent());
        response.setSaved(savedReelRepository.existsByUserIdAndReelId(currentUserId, response.getId()));
        return response;
    }
}
