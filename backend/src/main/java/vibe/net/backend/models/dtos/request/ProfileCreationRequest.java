package vibe.net.backend.models.dtos.request;


import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.enums.Gender;

import java.time.LocalDate;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCreationRequest {
    String bio;
    MultipartFile coverImage;
    MultipartFile avatar;
    String fullName;
    String phoneNumber;
    Gender gender;
    LocalDate dateOfBirth;
}
