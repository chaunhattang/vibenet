package vibe.net.backend.configs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vibe.net.backend.enums.Role;
import vibe.net.backend.enums.Status;
import vibe.net.backend.models.entities.User;
import vibe.net.backend.repositories.UserRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements ApplicationRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.email:admin@vibenet.local}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByUsername(adminUsername)) {
            return;
        }
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("Skipping admin seeding: app.admin.password (ADMIN_PASSWORD) is not set");
            return;
        }

        User admin = User.builder()
                .username(adminUsername)
                .email(adminEmail)
                .hashedPassword(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .status(Status.ACTIVE)
                .build();

        userRepository.save(admin);
        log.info("Seeded default admin account '{}'", adminUsername);
    }
}
