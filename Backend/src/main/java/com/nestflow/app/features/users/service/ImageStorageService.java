package com.nestflow.app.features.users.service;

import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ImageStorageService {
	private final String uploadDir = "/Backend/src/main/resources/static/upload/";

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
