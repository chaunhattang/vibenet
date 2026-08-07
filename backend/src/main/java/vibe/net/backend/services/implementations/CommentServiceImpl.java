package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.PostErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.mappers.CommentMapper;
import vibe.net.backend.models.dtos.request.CommentRequest;
import vibe.net.backend.models.dtos.response.CommentResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.entities.Comment;
import vibe.net.backend.models.entities.Post;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.CommentRepository;
import vibe.net.backend.repositories.PostRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.CommentService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentServiceImpl implements CommentService {
    CommentRepository commentRepository;
    PostRepository postRepository;
    UserRepository userRepository;
    CommentMapper commentMapper;
    NotificationPublisher notificationPublisher;

    @Override
    @Transactional
    public CommentResponse addComment(UUID postId, CommentRequest request) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(PostErrorCode.NOT_FOUND));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Comment comment = Comment.builder()
                .owner(user)
                .post(post)
                .content(request.getContent())
                .build();
        comment = commentRepository.saveAndFlush(comment);

        if (!post.getOwner().getId().equals(currentUserId)) {
            notificationPublisher.publish(post.getOwner().getId(), currentUserId, NotificationType.COMMENT, comment.getId());
        }

        return commentMapper.toResponse(comment);
    }

    @Override
    public PageResponse<CommentResponse> getCommentsByPostId(UUID postId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findByPostIdOrderByCreatedTimeDesc(postId, pageable);
        List<CommentResponse> responses = commentPage.getContent().stream()
                .map(commentMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<CommentResponse>builder()
                .currentPage(page)
                .totalPages(commentPage.getTotalPages())
                .pageSize(size)
                .totalElements(commentPage.getTotalElements())
                .data(responses)
                .build();
    }
}
