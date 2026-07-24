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
@Table(name = "locket_reactions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_moment_reactor", columnNames = {"moment_id", "recipient_id"})
        }
)
public class LocketReaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moment_id", nullable = false)
    LocketMoment moment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    User recipient;

    @Column(nullable = false)
    String emoji;

    @CreationTimestamp
    @Column(name = "reacted_at")
    LocalDateTime reactedAt;
}
