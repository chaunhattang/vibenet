package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.enums.ReactionType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.PostErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.models.entities.Post;
import vibe.net.backend.models.entities.Reaction;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.PostRepository;
import vibe.net.backend.repositories.ReactionRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.ReactionService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReactionServiceImpl implements ReactionService {
    ReactionRepository reactionRepository;
    PostRepository postRepository;
    UserRepository userRepository;
    NotificationPublisher notificationPublisher;

    @Override
    @Transactional
    public ReactionType toggleReaction(UUID postId, ReactionType newType) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(PostErrorCode.NOT_FOUND));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Optional<Reaction> existingReactionOpt = reactionRepository.findByPostIdAndUserId(postId, currentUserId);

        if (existingReactionOpt.isPresent()) {
            Reaction existingReaction = existingReactionOpt.get();
            if (existingReaction.getType() == newType) {
                reactionRepository.delete(existingReaction);
                return null;
            }
            existingReaction.setType(newType);
            reactionRepository.save(existingReaction);
            return newType;
        }

        Reaction newReaction = Reaction.builder()
                .post(post)
                .user(user)
                .type(newType)
                .build();
        reactionRepository.save(newReaction);

        if (!post.getOwner().getId().equals(currentUserId)) {
            notificationPublisher.publish(post.getOwner().getId(), currentUserId, NotificationType.REACTION, post.getId());
        }
        return newType;
    }
}
