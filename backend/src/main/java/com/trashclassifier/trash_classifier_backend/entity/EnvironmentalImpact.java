package com.trashclassifier.trash_classifier_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "environmental_impact")
public class EnvironmentalImpact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String material;

    @Column(name = "decomposition_time", length = 100)
    private String decompositionTime;

    @Column(name = "co2_per_kg")
    private Double co2PerKg;

    @Column(name = "recycling_rate")
    private Double recyclingRate;

    @Column(name = "fun_fact", columnDefinition = "TEXT")
    private String funFact;

    @Column(columnDefinition = "TEXT")
    private String tips;

    public EnvironmentalImpact() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getDecompositionTime() {
        return decompositionTime;
    }

    public void setDecompositionTime(String decompositionTime) {
        this.decompositionTime = decompositionTime;
    }

    public Double getCo2PerKg() {
        return co2PerKg;
    }

    public void setCo2PerKg(Double co2PerKg) {
        this.co2PerKg = co2PerKg;
    }

    public Double getRecyclingRate() {
        return recyclingRate;
    }

    public void setRecyclingRate(Double recyclingRate) {
        this.recyclingRate = recyclingRate;
    }

    public String getFunFact() {
        return funFact;
    }

    public void setFunFact(String funFact) {
        this.funFact = funFact;
    }

    public String getTips() {
        return tips;
    }

    public void setTips(String tips) {
        this.tips = tips;
    }
}