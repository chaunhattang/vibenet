package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.ReelErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.ReelCommentMapper;
import vibe.net.backend.models.dtos.request.CommentRequest;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.dtos.response.ReelCommentEvent;
import vibe.net.backend.models.dtos.response.ReelCommentResponse;
import vibe.net.backend.models.entities.Reel;
import vibe.net.backend.models.entities.ReelComment;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.ReelCommentRepository;
import vibe.net.backend.repositories.ReelRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.ReelCommentService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReelCommentServiceImpl implements ReelCommentService {
    ReelCommentRepository reelCommentRepository;
    ReelRepository reelRepository;
    UserRepository userRepository;
    ReelCommentMapper reelCommentMapper;
    NotificationPublisher notificationPublisher;
    SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ReelCommentResponse addComment(UUID reelId, CommentRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new AppException(ReelErrorCode.NOT_FOUND));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        ReelComment comment = ReelComment.builder()
                .owner(user)
                .reel(reel)
                .content(request.getContent())
                .build();
        comment = reelCommentRepository.saveAndFlush(comment);

        if (!reel.getCreator().getId().equals(currentUserId)) {
            notificationPublisher.publish(reel.getCreator().getId(), currentUserId, NotificationType.COMMENT, comment.getId());
        }

        ReelCommentResponse response = reelCommentMapper.toResponse(comment);

        int commentsCount = (int) reelCommentRepository.countByReelId(reelId);
        messagingTemplate.convertAndSend(
                "/topic/reels/" + reelId + "/comments",
                ReelCommentEvent.builder()
                        .reelId(reelId)
                        .commentsCount(commentsCount)
                        .comment(response)
                        .build());

        return response;
    }

    @Override
    public PageResponse<ReelCommentResponse> getCommentsByReelId(UUID reelId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReelComment> commentPage = reelCommentRepository.findByReelIdOrderByCreatedTimeDesc(reelId, pageable);
        List<ReelCommentResponse> responses = commentPage.getContent().stream()
                .map(reelCommentMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<ReelCommentResponse>builder()
                .currentPage(page)
                .totalPages(commentPage.getTotalPages())
                .pageSize(size)
                .totalElements(commentPage.getTotalElements())
                .data(responses)
                .build();
    }

    @Override
    @Transactional
    public void deleteComment(UUID reelId, UUID commentId) {
        ReelComment comment = reelCommentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ReelErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getReel().getId().equals(reelId)) {
            throw new AppException(ReelErrorCode.COMMENT_NOT_FOUND);
        }

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        boolean isCommentOwner = comment.getOwner().getId().equals(currentUserId);
        boolean isReelOwner = comment.getReel().getCreator().getId().equals(currentUserId);

        if (!isCommentOwner && !isReelOwner && !isAdmin) {
            throw new AppException(ReelErrorCode.COMMENT_UNAUTHORIZED);
        }

        reelCommentRepository.delete(comment);
    }
}
