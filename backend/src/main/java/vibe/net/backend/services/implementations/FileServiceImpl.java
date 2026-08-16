package vibe.net.backend.services.implementations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vibe.net.backend.services.interfaces.FileService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {
    @Value("${file.upload-dir}")
    private String uploadDir;

    public String uploadFile(MultipartFile file, String folder) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("You selected an empty file!");
        }

        Path uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path folderPath = uploadRoot.resolve(folder).normalize();

        if (!folderPath.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Invalid folder path");
        }

        if (!Files.exists(folderPath)) {
            Files.createDirectories(folderPath);
        }

        String fileName = UUID.randomUUID()
                + getFileExtension(file.getOriginalFilename());

        Path filePath = folderPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + folder + "/" + fileName;
    }

    public void deleteFile(String path) {
        if (path == null || path.isBlank()) return;

        try {
            String relativePath = path.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir, relativePath);

            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        int dotIndex = filename.lastIndexOf(".");
        if (dotIndex < 0) return ".jpg";
        return filename.substring(dotIndex);
    }
}
