package vibe.net.backend.models.dtos.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import vibe.net.backend.enums.Gender;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileResponse {
    UUID id;

    String fullName;

    String bio;

    String phoneNumber;

    Gender gender;

    LocalDate dateOfBirth;

    String avatarUrl;

    String coverImageUrl;
}
