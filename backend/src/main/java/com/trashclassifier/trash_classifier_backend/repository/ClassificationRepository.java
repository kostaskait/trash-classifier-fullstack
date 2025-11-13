package com.trashclassifier.trash_classifier_backend.repository;

import com.trashclassifier.trash_classifier_backend.entity.Classification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClassificationRepository extends JpaRepository<Classification, Long> {
    
    List<Classification> findAllByOrderByCreatedAtDesc();
    
    List<Classification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT c.predictedClass, COUNT(c) FROM Classification c GROUP BY c.predictedClass")
    List<Object[]> countByPredictedClass();
}