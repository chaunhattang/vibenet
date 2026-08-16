package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import vibe.net.backend.models.dtos.request.ChatMessageRequest;
import vibe.net.backend.models.dtos.response.ChatMessageResponse;
import vibe.net.backend.services.interfaces.ChatService;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatWebSocketController {

    ChatService chatService;
    SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatWsRequest request, Principal principal) {
        UUID senderId = UUID.fromString(principal.getName());

        ChatMessageRequest msgRequest = ChatMessageRequest.builder()
                .recipientId(request.getRecipientId())
                .content(request.getContent())
                .build();

        ChatMessageResponse saved = chatService.saveMessage(msgRequest, senderId);

        messagingTemplate.convertAndSend("/user/" + request.getRecipientId() + "/queue/messages", saved);
        messagingTemplate.convertAndSend("/user/" + senderId + "/queue/messages", saved);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        messagingTemplate.convertAndSend(
                "/topic/chat/" + request.getChatId() + "/typing",
                new TypingEvent(userId, request.isTyping()));
    }

    @MessageMapping("/chat.read")
    public void read(@Payload ReadRequest request, Principal principal) {
        UUID userId = UUID.fromString(principal.getName());
        messagingTemplate.convertAndSend(
                "/topic/chat/" + request.getChatId() + "/read",
                new ReadEvent(userId, request.getLastMessageId()));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatWsRequest {
        private UUID recipientId;
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypingRequest {
        private String chatId;
        private boolean isTyping;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadRequest {
        private String chatId;
        private UUID lastMessageId;
    }

    @Data
    @AllArgsConstructor
    public static class TypingEvent {
        private UUID userId;
        private boolean isTyping;
    }

    @Data
    @AllArgsConstructor
    public static class ReadEvent {
        private UUID userId;
        private UUID lastMessageId;
    }
}
