package com.example.englishhapp.repository;

import com.example.englishhapp.model.UserQuestionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserQuestionHistoryRepository extends JpaRepository<UserQuestionHistory, Long> {
    List<UserQuestionHistory> findByUsernameIgnoreCase(String username);
    List<UserQuestionHistory> findByUsernameIgnoreCaseAndCategoryIgnoreCase(String username, String category);
}