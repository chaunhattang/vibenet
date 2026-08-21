package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import vibe.net.backend.models.dtos.request.ChatMessageRequest;
import vibe.net.backend.models.dtos.response.ChatMessageResponse;
import vibe.net.backend.models.dtos.response.ChatRoomResponse;
import vibe.net.backend.models.dtos.response.PageResponse;

import java.util.List;
import java.util.UUID;

@Service
public interface ChatService {
    String getOrCreateChatRoom(UUID userId1, UUID userId2);

    List<ChatRoomResponse> getChatRoomsForUser(UUID userId);

    ChatMessageResponse saveMessage(ChatMessageRequest request, UUID senderId);

    PageResponse<ChatMessageResponse> getMessages(String chatId, int page, int size);
    void markChatMessagesAsRead(String chatId, UUID readerId);
}
