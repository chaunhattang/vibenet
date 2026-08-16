package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.enums.ReactionType;

import java.util.Map;
import java.util.UUID;

@Service
public interface CommentReactionService {
    /**
     * @return {"likesCount": int, "isLiked": boolean} for the comment after toggling.
     */
    Map<String, Object> toggleReaction(UUID commentId, ReactionType newType);
}
