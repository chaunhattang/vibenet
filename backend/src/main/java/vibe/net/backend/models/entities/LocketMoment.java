package vibe.net.backend.models.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import vibe.net.backend.enums.MediaType;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "locket_moments", indexes = {
        @Index(name = "idx_moment_sender_created", columnList = "sender_id, created_at DESC")
})
public class LocketMoment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    User sender;

    @Column(name = "media_url", nullable = false)
    String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    MediaType mediaType;

    @Column(name = "duration_seconds")
    Integer durationSeconds;

    @Column(length = 280)
    String caption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_moment_id")
    LocketMoment replyToMoment;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
