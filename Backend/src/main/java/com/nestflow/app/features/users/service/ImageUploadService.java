package com.nestflow.app.features.users.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageUploadService {

    @Value("${upload.directory:./uploads}") // Default value if not configured
    private String uploadDir;

    public String uploadImage(MultipartFile imageFile) throws IOException {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        Files.copy(imageFile.getInputStream(), filePath);

        return filePath.toString();
    }
}