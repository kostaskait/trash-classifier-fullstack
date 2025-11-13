package com.trashclassifier.trash_classifier_backend.repository;

import com.trashclassifier.trash_classifier_backend.entity.EnvironmentalImpact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnvironmentalImpactRepository extends JpaRepository<EnvironmentalImpact, Long> {
    
    Optional<EnvironmentalImpact> findByMaterial(String material);
}