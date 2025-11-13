package com.trashclassifier.trash_classifier_backend.controller;

import com.trashclassifier.trash_classifier_backend.entity.Classification;
import com.trashclassifier.trash_classifier_backend.entity.ClassificationScore;
import com.trashclassifier.trash_classifier_backend.model.PredictionResponse;
import com.trashclassifier.trash_classifier_backend.repository.ClassificationRepository;
import com.trashclassifier.trash_classifier_backend.service.ModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class PredictionController {

    @Autowired
    private ModelService modelService;

    @Autowired
    private ClassificationRepository classificationRepository;

    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestParam("image") MultipartFile file) {
        try {
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

            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size must be less than 10MB");
            }

            byte[] imageBytes = file.getBytes();
            PredictionResponse response = modelService.predict(imageBytes);

            Classification classification = new Classification(
                response.getPredictedClass(),
                response.getConfidence(),
                file.getOriginalFilename()
            );

            for (Map.Entry<String, Double> entry : response.getAllScores().entrySet()) {
                ClassificationScore score = new ClassificationScore(
                    entry.getKey(),
                    entry.getValue()
                );
                classification.addScore(score);
            }

            classificationRepository.save(classification);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing image: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        try {
            List<Classification> history = classificationRepository.findAllByOrderByCreatedAtDesc();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching history: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running!");
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        try {
            List<Object[]> countByClass = classificationRepository.countByPredictedClass();
            
            Map<String, Object> statistics = new java.util.LinkedHashMap<>();
            statistics.put("totalClassifications", classificationRepository.count());
            
            List<Map<String, Object>> classDistribution = new java.util.ArrayList<>();
            for (Object[] row : countByClass) {
                Map<String, Object> item = new java.util.LinkedHashMap<>();
                item.put("name", row[0]);
                item.put("count", row[1]);
                classDistribution.add(item);
            }
            statistics.put("distribution", classDistribution);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching statistics: " + e.getMessage());
        }
    }

    @Autowired
    private com.trashclassifier.trash_classifier_backend.repository.EnvironmentalImpactRepository environmentalImpactRepository;

    @GetMapping("/environmental")
    public ResponseEntity<?> getAllEnvironmentalInfo() {
        try {
            List<com.trashclassifier.trash_classifier_backend.entity.EnvironmentalImpact> data = 
                environmentalImpactRepository.findAll();
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching environmental data: " + e.getMessage());
        }
    }

    @GetMapping("/environmental/{material}")
    public ResponseEntity<?> getEnvironmentalInfo(@PathVariable String material) {
        try {
            Optional<com.trashclassifier.trash_classifier_backend.entity.EnvironmentalImpact> data = 
                environmentalImpactRepository.findByMaterial(material);
            
            if (data.isPresent()) {
                return ResponseEntity.ok(data.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching environmental data: " + e.getMessage());
        }
    }
}