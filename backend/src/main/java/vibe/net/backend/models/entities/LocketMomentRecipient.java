package vibe.net.backend.models.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "locket_moment_recipients",
        indexes = {
                @Index(name = "idx_recipient_delivered", columnList = "recipient_id, delivered_at DESC")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_moment_recipient", columnNames = {"moment_id", "recipient_id"})
        }
)
public class LocketMomentRecipient {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moment_id", nullable = false)
    LocketMoment moment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    User recipient;

    @CreationTimestamp
    @Column(name = "delivered_at", updatable = false)
    LocalDateTime deliveredAt;

    @Column(name = "viewed_at")
    LocalDateTime viewedAt;
}
