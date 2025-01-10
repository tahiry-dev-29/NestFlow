package com.nestflow.app.features.users.controller;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ImageController {

	private final String uploadDir = "uploads";

	@GetMapping("/upload/{filename}")
	public ResponseEntity<Resource> getImage(@PathVariable String filename) {
		try {
			Path imagePath = Paths.get(uploadDir).resolve(filename);
			Resource resource = new UrlResource(imagePath.toUri());

			if (resource.exists() && resource.isReadable()) {
				return ResponseEntity.ok()
					.contentType(MediaType.IMAGE_JPEG)
					.body(resource);
			}
			return ResponseEntity.notFound().build();
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}
}