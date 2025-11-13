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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteClassification(@PathVariable Long id) {
        try {
            if (classificationRepository.existsById(id)) {
                classificationRepository.deleteById(id);
                return ResponseEntity.ok("Classification deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting classification: " + e.getMessage());
        }
    }

    @DeleteMapping("/history/clear")
    public ResponseEntity<?> clearAllHistory() {
        try {
            classificationRepository.deleteAll();
            return ResponseEntity.ok("All history cleared successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error clearing history: " + e.getMessage());
        }
    }

    @GetMapping("/statistics/timeframe")
    public ResponseEntity<?> getStatisticsByTimeframe(@RequestParam(defaultValue = "all") String timeframe) {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startDate;
            
            switch (timeframe.toLowerCase()) {
                case "week":
                    startDate = now.minusDays(7);
                    break;
                case "month":
                    startDate = now.minusDays(30);
                    break;
                case "all":
                default:
                    startDate = LocalDateTime.of(2000, 1, 1, 0, 0);
                    break;
            }
            
            List<Classification> filteredClassifications = 
                classificationRepository.findByCreatedAtBetween(startDate, now);
            
            Map<String, Object> statistics = new java.util.LinkedHashMap<>();
            statistics.put("totalClassifications", filteredClassifications.size());
            statistics.put("timeframe", timeframe);
            statistics.put("startDate", startDate);
            statistics.put("endDate", now);
            
            // Group by class
            Map<String, Long> distribution = filteredClassifications.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    Classification::getPredictedClass,
                    java.util.stream.Collectors.counting()
                ));
            
            List<Map<String, Object>> classDistribution = new java.util.ArrayList<>();
            for (Map.Entry<String, Long> entry : distribution.entrySet()) {
                Map<String, Object> item = new java.util.LinkedHashMap<>();
                item.put("name", entry.getKey());
                item.put("count", entry.getValue());
                classDistribution.add(item);
            }
            statistics.put("distribution", classDistribution);
            
            // Daily trend (last 7 or 30 days)
            int days = timeframe.equals("week") ? 7 : (timeframe.equals("month") ? 30 : 7);
            List<Map<String, Object>> dailyTrend = new java.util.ArrayList<>();
            
            for (int i = days - 1; i >= 0; i--) {
                LocalDateTime dayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0);
                LocalDateTime dayEnd = now.minusDays(i).withHour(23).withMinute(59).withSecond(59);
                
                long count = filteredClassifications.stream()
                    .filter(c -> c.getCreatedAt().isAfter(dayStart) && c.getCreatedAt().isBefore(dayEnd))
                    .count();
                
                Map<String, Object> dayData = new java.util.LinkedHashMap<>();
                dayData.put("date", dayStart.toLocalDate().toString());
                dayData.put("count", count);
                dailyTrend.add(dayData);
            }
            statistics.put("dailyTrend", dailyTrend);
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching statistics: " + e.getMessage());
        }
    }
}