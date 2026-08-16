package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.enums.ReactionType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.ReelErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.models.entities.Reel;
import vibe.net.backend.models.entities.ReelReaction;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.ReelReactionRepository;
import vibe.net.backend.repositories.ReelRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.ReelReactionService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReelReactionServiceImpl implements ReelReactionService {
    ReelReactionRepository reelReactionRepository;
    ReelRepository reelRepository;
    UserRepository userRepository;
    NotificationPublisher notificationPublisher;

    @Override
    @Transactional
    public ReactionType toggleReaction(UUID reelId, ReactionType newType) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new AppException(ReelErrorCode.NOT_FOUND));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Optional<ReelReaction> existingOpt = reelReactionRepository.findByReelIdAndUserId(reelId, currentUserId);

        if (existingOpt.isPresent()) {
            ReelReaction existing = existingOpt.get();
            if (existing.getType() == newType) {
                reelReactionRepository.delete(existing);
                return null;
            }
            existing.setType(newType);
            reelReactionRepository.save(existing);
            return newType;
        }

        ReelReaction newReaction = ReelReaction.builder()
                .reel(reel)
                .user(user)
                .type(newType)
                .build();
        reelReactionRepository.save(newReaction);

        if (!reel.getCreator().getId().equals(currentUserId)) {
            notificationPublisher.publish(reel.getCreator().getId(), currentUserId, NotificationType.REACTION, reel.getId());
        }
        return newType;
    }
}
