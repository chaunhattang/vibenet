package vibe.net.backend.models.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.Role;
import vibe.net.backend.enums.Status;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false)
    String username;

    String hashedPassword;

    @Enumerated(EnumType.STRING)
    Role role;

    @Column(unique = true, nullable = false)
    String email;

    String phoneNumber;

    Status status;

    String refreshToken;

    LocalDateTime tokenExpireTime;

    LocalDateTime lastActiveAt;

    @OneToOne(fetch = FetchType.LAZY)
    Profile profile;
}
