package com.nestflow.app.features.upload.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ImageStorageService {
	@Value("${upload.directory}")
	private String uploadDir;

	public String storeImage(byte[] imageData) throws IOException {
		String imageId = generateImageId();
		Path dirPath = Paths.get(uploadDir);
		if (!Files.exists(dirPath)) {
			Files.createDirectories(dirPath);
		}
		Path imagePath = Paths.get(uploadDir + imageId);
		Files.write(imagePath, imageData);
		return imageId;
	}

	public byte[] getImageBytes(String imageName) throws IOException {
		Path imagePath = Paths.get(uploadDir + imageName);
		if (!Files.exists(imagePath)) {
			return null;
		}
		return Files.readAllBytes(imagePath);
	}

	private String generateImageId() {
		return "img_" + System.currentTimeMillis();
	}
}
