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
public class ReelComment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    String content;

    @CreationTimestamp
    LocalDateTime createdTime;

    @ManyToOne(fetch = FetchType.LAZY)
    User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    Reel reel;
}
