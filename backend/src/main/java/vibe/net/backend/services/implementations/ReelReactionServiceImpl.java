package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import vibe.net.backend.enums.NotificationType;
import vibe.net.backend.enums.ReactionType;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.ReelErrorCode;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.models.dtos.response.ReelReactionEvent;
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
    ReactionInsertHelper reactionInsertHelper;
    SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public ReactionType toggleReaction(UUID reelId, ReactionType newType) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();

        Reel reel = reelRepository.findById(reelId)
                .orElseThrow(() -> new AppException(ReelErrorCode.NOT_FOUND));
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        Optional<ReelReaction> existingOpt = reelReactionRepository.findByReelIdAndUserId(reelId, currentUserId);

        ReactionType result;
        if (existingOpt.isPresent()) {
            ReelReaction existing = existingOpt.get();
            if (existing.getType() == newType) {
                reelReactionRepository.delete(existing);
                result = null;
            } else {
                existing.setType(newType);
                reelReactionRepository.save(existing);
                result = newType;
            }
        } else {
            ReelReaction newReaction = ReelReaction.builder()
                    .reel(reel)
                    .user(user)
                    .type(newType)
                    .build();
            try {
                reactionInsertHelper.insert(newReaction);
            } catch (DataIntegrityViolationException e) {
                // Lost a race against a concurrent toggle (e.g. a rapid double-tap) that already
                // inserted a reaction for this (reel, user) pair; fall back to updating it instead.
                ReelReaction existing = reelReactionRepository.findByReelIdAndUserId(reelId, currentUserId)
                        .orElseThrow(() -> e);
                existing.setType(newType);
                reelReactionRepository.save(existing);
            }
            result = newType;

            if (!reel.getCreator().getId().equals(currentUserId)) {
                notificationPublisher.publish(reel.getCreator().getId(), currentUserId, NotificationType.REACTION, reel.getId());
            }
        }

        int likesCount = (int) reelReactionRepository.countByReelId(reelId);
        messagingTemplate.convertAndSend(
                "/topic/reels/" + reelId + "/reactions",
                ReelReactionEvent.builder()
                        .reelId(reelId)
                        .likesCount(likesCount)
                        .actorUserId(currentUserId)
                        .actorReaction(result)
                        .build());

        return result;
    }
}
