package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.enums.ReactionType;

import java.util.UUID;

@Service
public interface ReactionService {
    void toggleReaction(UUID postId, ReactionType newType);
}
