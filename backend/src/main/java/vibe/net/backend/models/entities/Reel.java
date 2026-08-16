package vibe.net.backend.models.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Reel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    User creator;

    @Column(name = "video_url", nullable = false)
    String videoUrl;

    @Column(name = "thumbnail_url")
    String thumbnailUrl;

    @Column(name = "duration_seconds")
    @Builder.Default
    int durationSeconds = 0;

    @Column(columnDefinition = "TEXT")
    String caption;

    @Column(name = "audio_title")
    String audioTitle;

    @Column(name = "views_count")
    @Builder.Default
    long viewsCount = 0L;

    @Column(name = "shares_count")
    @Builder.Default
    long sharesCount = 0L;

    @ElementCollection
    @CollectionTable(name = "reel_tags", joinColumns = @JoinColumn(name = "reel_id"))
    @Column(name = "tag")
    @Builder.Default
    List<String> tags = new ArrayList<>();

    @CreationTimestamp
    LocalDateTime createdAt;
}
