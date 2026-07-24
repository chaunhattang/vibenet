package vibe.net.backend.models.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangePasswordRequest {
    @NotBlank
    String currentPassword;

    @NotBlank
    @Size(min = 8, message = "New password must be at least 8 characters")
    String newPassword;
}
