package vibe.net.backend.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vibe.net.backend.models.entities.ChatMessage;

import java.util.Optional;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    Page<ChatMessage> findByChatIdOrderByTimestampDesc(String chatId, Pageable pageable);

    Optional<ChatMessage> findTopByChatIdOrderByTimestampDesc(String chatId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP WHERE m.chatId = :chatId AND m.recipient.id = :readerId AND m.isRead = false")
    int markChatMessagesAsRead(@Param("chatId") String chatId, @Param("readerId") UUID readerId);
}
