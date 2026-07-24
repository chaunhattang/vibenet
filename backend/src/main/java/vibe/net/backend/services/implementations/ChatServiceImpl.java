package vibe.net.backend.services.implementations;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vibe.net.backend.exception.AppException;
import vibe.net.backend.exception.errors.UserErrorCode;
import vibe.net.backend.models.dtos.request.ChatMessageRequest;
import vibe.net.backend.models.dtos.response.ChatMessageResponse;
import vibe.net.backend.models.dtos.response.ChatRoomResponse;
import vibe.net.backend.models.dtos.response.PageResponse;
import vibe.net.backend.models.entities.ChatMessage;
import vibe.net.backend.models.entities.ChatRoom;
import vibe.net.backend.models.entities.Friendship;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.ChatMessageRepository;
import vibe.net.backend.repositories.ChatRoomRepository;
import vibe.net.backend.repositories.FriendshipRepository;
import vibe.net.backend.repositories.UserRepository;
import vibe.net.backend.services.interfaces.ChatService;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatServiceImpl implements ChatService {

    ChatRoomRepository chatRoomRepository;
    ChatMessageRepository chatMessageRepository;
    FriendshipRepository friendshipRepository;
    UserRepository userRepository;

    @Override
    @Transactional
    public String getOrCreateChatRoom(UUID userId1, UUID userId2) {
        String chatId = buildChatId(userId1, userId2);

        Optional<ChatRoom> existing = chatRoomRepository.findByChatId(chatId);
        if (existing.isPresent()) {
            return chatId;
        }

        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        ChatRoom room = ChatRoom.builder()
                .chatId(chatId)
                .sender(user1)
                .recipient(user2)
                .build();
        chatRoomRepository.save(room);

        return chatId;
    }

    @Override
    public List<ChatRoomResponse> getChatRoomsForUser(UUID userId) {
        List<ChatRoom> rooms = chatRoomRepository.findAllByUserId(userId);
        Set<UUID> existingFriendIds = new HashSet<>();
        List<ChatRoomResponse> result = new ArrayList<>();

        for (ChatRoom room : rooms) {
            UUID friendId = room.getSender().getId().equals(userId)
                    ? room.getRecipient().getId()
                    : room.getSender().getId();
            existingFriendIds.add(friendId);

            User friend = room.getSender().getId().equals(userId) ? room.getRecipient() : room.getSender();
            Optional<ChatMessage> lastMsg = chatMessageRepository.findTopByChatIdOrderByTimestampDesc(room.getChatId());

            result.add(ChatRoomResponse.builder()
                    .chatId(room.getChatId())
                    .friendId(friendId)
                    .friendName(getFriendDisplayName(friend))
                    .friendAvatar(getFriendAvatar(friend))
                    .lastMessage(lastMsg.map(ChatMessage::getContent).orElse(null))
                    .lastMessageTime(lastMsg.map(ChatMessage::getTimestamp).orElse(null))
                    .friendLastActiveAt(friend.getLastActiveAt())
                    .build());
        }

        List<Friendship> friendships = friendshipRepository.findAllFriendsByUserId(userId);
        for (Friendship fs : friendships) {
            UUID friendId = fs.getSender().getId().equals(userId)
                    ? fs.getReceiver().getId()
                    : fs.getSender().getId();

            if (!existingFriendIds.contains(friendId)) {
                User friend = fs.getSender().getId().equals(userId) ? fs.getReceiver() : fs.getSender();
                String chatId = buildChatId(userId, friendId);

                result.add(ChatRoomResponse.builder()
                        .chatId(chatId)
                        .friendId(friendId)
                        .friendName(getFriendDisplayName(friend))
                        .friendAvatar(getFriendAvatar(friend))
                        .lastMessage(null)
                        .lastMessageTime(null)
                        .friendLastActiveAt(friend.getLastActiveAt())
                        .build());
            }
        }

        result.sort((a, b) -> {
            if (a.getLastMessageTime() == null && b.getLastMessageTime() == null) return 0;
            if (a.getLastMessageTime() == null) return 1;
            if (b.getLastMessageTime() == null) return -1;
            return b.getLastMessageTime().compareTo(a.getLastMessageTime());
        });

        return result;
    }

    @Override
    @Transactional
    public ChatMessageResponse saveMessage(ChatMessageRequest request, UUID senderId) {
        UUID recipientId = request.getRecipientId();
        String chatId = getOrCreateChatRoom(senderId, recipientId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new AppException(UserErrorCode.NOT_FOUND));

        ChatMessage message = ChatMessage.builder()
                .chatId(chatId)
                .sender(sender)
                .recipient(recipient)
                .content(request.getContent())
                .build();

        message = chatMessageRepository.save(message);
        return toMessageResponse(message);
    }

    @Override
    public PageResponse<ChatMessageResponse> getMessages(String chatId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messagePage = chatMessageRepository.findByChatIdOrderByTimestampDesc(chatId, pageable);

        List<ChatMessageResponse> data = messagePage.getContent().stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());

        return PageResponse.<ChatMessageResponse>builder()
                .currentPage(messagePage.getNumber())
                .totalPages(messagePage.getTotalPages())
                .pageSize(messagePage.getSize())
                .totalElements(messagePage.getTotalElements())
                .data(data)
                .build();
    }

    private String buildChatId(UUID id1, UUID id2) {
        String s1 = id1.toString();
        String s2 = id2.toString();
        return s1.compareTo(s2) < 0 ? s1 + "_" + s2 : s2 + "_" + s1;
    }

    private String getFriendDisplayName(User user) {
        if (user.getProfile() != null && user.getProfile().getFullName() != null) {
            return user.getProfile().getFullName();
        }
        return user.getUsername();
    }

    private String getFriendAvatar(User user) {
        return user.getProfile() != null ? user.getProfile().getAvatarUrl() : null;
    }

    private ChatMessageResponse toMessageResponse(ChatMessage msg) {
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .chatId(msg.getChatId())
                .senderId(msg.getSender().getId())
                .senderName(getFriendDisplayName(msg.getSender()))
                .senderAvatar(getFriendAvatar(msg.getSender()))
                .recipientId(msg.getRecipient().getId())
                .content(msg.getContent())
                .timestamp(msg.getTimestamp())
                .build();
    }
}
