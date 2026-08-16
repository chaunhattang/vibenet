package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.enums.ReactionType;

import java.util.UUID;

@Service
public interface ReelReactionService {
    /**
     * @return the caller's resulting reaction on the reel, or null if the reaction was removed.
     */
    ReactionType toggleReaction(UUID reelId, ReactionType newType);
}
