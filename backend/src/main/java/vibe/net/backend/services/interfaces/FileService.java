package vibe.net.backend.services.interfaces;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public interface FileService {
    String uploadFile(MultipartFile file, String folder) throws IOException;
    void deleteFile(String path);
}
