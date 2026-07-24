package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vibe.net.backend.models.entities.ChatMessage;

import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    Page<ChatMessage> findByChatIdOrderByTimestampDesc(String chatId, Pageable pageable);

    Optional<ChatMessage> findTopByChatIdOrderByTimestampDesc(String chatId);
}
