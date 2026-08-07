package vibe.net.backend.models.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import vibe.net.backend.enums.Platform;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "device_tokens",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_push_token", columnNames = {"user_id", "push_token"})
        }
)
public class DeviceToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    Platform platform;

    @Column(name = "push_token", nullable = false)
    String pushToken;

    @Column(name = "widget_token", length = 1000)
    String widgetToken;

    @CreationTimestamp
    @Column(name = "registered_at", updatable = false)
    LocalDateTime registeredAt;
}
