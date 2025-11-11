package com.trashclassifier.trash_classifier_backend.model;

import java.util.Map;

public class PredictionResponse {
    private String predictedClass;
    private double confidence;
    private Map<String, Double> allScores;

    public PredictionResponse() {
    }

    public PredictionResponse(String predictedClass, double confidence, Map<String, Double> allScores) {
        this.predictedClass = predictedClass;
        this.confidence = confidence;
        this.allScores = allScores;
    }

    public String getPredictedClass() {
        return predictedClass;
    }

    public void setPredictedClass(String predictedClass) {
        this.predictedClass = predictedClass;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public Map<String, Double> getAllScores() {
        return allScores;
    }

    public void setAllScores(Map<String, Double> allScores) {
        this.allScores = allScores;
    }
}