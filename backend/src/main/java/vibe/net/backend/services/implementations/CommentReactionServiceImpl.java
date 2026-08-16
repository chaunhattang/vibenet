package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.enums.ReactionType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.CommentErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.models.entities.Comment;
import vibe.net.backend.models.entities.CommentReaction;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.CommentReactionRepository;
import vibe.net.backend.repositories.CommentRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.CommentReactionService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentReactionServiceImpl implements CommentReactionService {
    CommentReactionRepository commentReactionRepository;
    CommentRepository commentRepository;
    UserRepository userRepository;
    NotificationPublisher notificationPublisher;

    @Override
    @Transactional
    public Map<String, Object> toggleReaction(UUID commentId, ReactionType newType) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(CommentErrorCode.NOT_FOUND));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Optional<CommentReaction> existingOpt = commentReactionRepository.findByCommentIdAndUserId(commentId, currentUserId);

        boolean isLiked;
        if (existingOpt.isPresent()) {
            CommentReaction existing = existingOpt.get();
            if (existing.getType() == newType) {
                commentReactionRepository.delete(existing);
                isLiked = false;
            } else {
                existing.setType(newType);
                commentReactionRepository.save(existing);
                isLiked = true;
            }
        } else {
            CommentReaction newReaction = CommentReaction.builder()
                    .comment(comment)
                    .user(user)
                    .type(newType)
                    .build();
            commentReactionRepository.save(newReaction);
            isLiked = true;

            if (!comment.getOwner().getId().equals(currentUserId)) {
                notificationPublisher.publish(comment.getOwner().getId(), currentUserId, NotificationType.REACTION, comment.getId());
            }
        }

        long likesCount = commentReactionRepository.countByCommentId(commentId);
        return Map.of("likesCount", (int) likesCount, "isLiked", isLiked);
    }
}
