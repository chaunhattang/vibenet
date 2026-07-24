package vibe.net.backend.controllers;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vibe.net.backend.models.dtos.response.ApiResponse;
import vibe.net.backend.models.dtos.response.ChatMessageResponse;
import vibe.net.backend.models.dtos.response.ChatRoomResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.services.interfaces.ChatService;
import vibe.net.backend.utils.SecurityUtils;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {

    ChatService chatService;

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/rooms")
    public ApiResponse<List<ChatRoomResponse>> getChatRooms() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<List<ChatRoomResponse>>builder()
                .result(chatService.getChatRoomsForUser(userId))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/rooms/{chatId}/messages")
    public ApiResponse<PageResponse<ChatMessageResponse>> getMessages(
            @PathVariable String chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.<PageResponse<ChatMessageResponse>>builder()
                .result(chatService.getMessages(chatId, page, size))
                .build();
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @GetMapping("/{friendId}/room")
    public ApiResponse<String> getOrCreateRoom(@PathVariable UUID friendId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.<String>builder()
                .result(chatService.getOrCreateChatRoom(userId, friendId))
                .build();
    }
}
