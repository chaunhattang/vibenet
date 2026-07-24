package vibe.net.backend.models.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "profile_visits",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_owner_visitor", columnNames = {"owner_id", "visitor_id"})
        }
)
public class ProfileVisit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    User profileOwner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visitor_id", nullable = false)
    User visitor;

    @Column(name = "visited_at", nullable = false)
    LocalDateTime visitedAt;
}
