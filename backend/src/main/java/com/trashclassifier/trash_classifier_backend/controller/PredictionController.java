package com.trashclassifier.trash_classifier_backend.controller;

import com.trashclassifier.trash_classifier_backend.model.PredictionResponse;
import com.trashclassifier.trash_classifier_backend.service.ModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class PredictionController {

    @Autowired
    private ModelService modelService;

    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestParam("image") MultipartFile file) {
        try {
            // 1. Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("No file uploaded");
            }

            String contentType = file.getContentType();
            if (contentType == null || 
                (!contentType.equals("image/jpeg") && 
                 !contentType.equals("image/png") && 
                 !contentType.equals("image/jpg"))) {
                return ResponseEntity.badRequest().body("Only JPEG/PNG images are allowed");
            }

            // 2. Check file size (max 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size must be less than 10MB");
            }

            // 3. Get prediction
            byte[] imageBytes = file.getBytes();
            PredictionResponse response = modelService.predict(imageBytes);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing image: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running! ✅");
    }
}