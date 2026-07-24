package vibe.net.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vibe.net.backend.models.entities.ChatRoom;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {
    Optional<ChatRoom> findByChatId(String chatId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.sender.id = :userId OR cr.recipient.id = :userId")
    List<ChatRoom> findAllByUserId(UUID userId);

    Optional<ChatRoom> findBySenderIdAndRecipientId(UUID senderId, UUID recipientId);
}
