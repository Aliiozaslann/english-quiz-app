package com.example.englishhapp.repository;

import com.example.englishhapp.model.SentencePattern;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatternRepository extends JpaRepository<SentencePattern, Long> {
    List<SentencePattern> findByCategory(String category);
}