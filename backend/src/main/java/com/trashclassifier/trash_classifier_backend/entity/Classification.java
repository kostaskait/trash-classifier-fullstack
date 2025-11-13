package com.trashclassifier.trash_classifier_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "classifications")
public class Classification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "predicted_class", nullable = false, length = 20)
    private String predictedClass;

    @Column(nullable = false)
    private Double confidence;

    @Column(name = "image_name", length = 255)
    private String imageName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "classification", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClassificationScore> scores = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Classification() {
    }

    public Classification(String predictedClass, Double confidence, String imageName) {
        this.predictedClass = predictedClass;
        this.confidence = confidence;
        this.imageName = imageName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPredictedClass() {
        return predictedClass;
    }

    public void setPredictedClass(String predictedClass) {
        this.predictedClass = predictedClass;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<ClassificationScore> getScores() {
        return scores;
    }

    public void setScores(List<ClassificationScore> scores) {
        this.scores = scores;
    }

    public void addScore(ClassificationScore score) {
        scores.add(score);
        score.setClassification(this);
    }
}