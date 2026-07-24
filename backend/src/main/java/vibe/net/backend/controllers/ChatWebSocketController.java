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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatWsRequest {
        private UUID recipientId;
        private String content;
    }
}
