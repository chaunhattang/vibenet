package vibe.net.backend.models.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(name = "chat_id", nullable = false)
    String chatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    User recipient;

    @Column(columnDefinition = "TEXT", nullable = false)
    String content;

    @CreationTimestamp
    LocalDateTime timestamp;

    @Column(name = "is_read", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    boolean isRead = false;

    @Column(name = "read_at")
    LocalDateTime readAt;
}
