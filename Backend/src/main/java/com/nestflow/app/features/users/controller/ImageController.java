package com.nestflow.app.features.users.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nestflow.app.features.users.service.ImageStorageService;
import java.io.IOException;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
public class ImageController {

	@Autowired
	private ImageStorageService imageStorageService;

	@GetMapping("/upload/{imageName}")
	public ResponseEntity<byte[]> getImage(@PathVariable String imageName) throws IOException {
		byte[] imageData = imageStorageService.getImageBytes(imageName);
		if (imageData == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok()
				.contentType(MediaType.IMAGE_JPEG)
				.body(imageData);
	}
}