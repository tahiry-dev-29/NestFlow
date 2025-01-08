package com.nestflow.app.features.users.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ImageUploadService {
    private final ImageStorageService imageStorageService;

    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        return imageStorageService.storeImage(file.getBytes());
    }
}
