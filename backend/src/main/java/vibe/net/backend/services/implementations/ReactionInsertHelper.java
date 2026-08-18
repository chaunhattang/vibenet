package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;
import vibe.net.backend.models.entities.CommentReaction;
import vibe.net.backend.models.entities.Reaction;
import vibe.net.backend.models.entities.ReelReaction;
import vibe.net.backend.repositories.CommentReactionRepository;
import vibe.net.backend.repositories.ReactionRepository;
import vibe.net.backend.repositories.ReelReactionRepository;

/**
 * Inserts a new reaction row in its own transaction (REQUIRES_NEW).
 * A unique-constraint violation here (concurrent toggle racing on the same
 * post/reel/comment + user pair) then only rolls back this isolated
 * transaction instead of aborting the caller's transaction, so the caller
 * can safely fall back to updating the row that won the race.
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReactionInsertHelper {
    ReactionRepository reactionRepository;
    ReelReactionRepository reelReactionRepository;
    CommentReactionRepository commentReactionRepository;

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void insert(Reaction reaction) {
        reactionRepository.saveAndFlush(reaction);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void insert(ReelReaction reaction) {
        reelReactionRepository.saveAndFlush(reaction);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public void insert(CommentReaction reaction) {
        commentReactionRepository.saveAndFlush(reaction);
    }
}
