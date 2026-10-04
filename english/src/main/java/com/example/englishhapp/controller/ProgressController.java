package com.example.englishhapp.controller;

import com.example.englishhapp.model.UserQuestionHistory;
import com.example.englishhapp.repository.UserQuestionHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class ProgressController {

    private final UserQuestionHistoryRepository historyRepository;

    public ProgressController(UserQuestionHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    // Çözülen her soruyu kaydet
    @PostMapping("/record")
    public ResponseEntity<?> recordAnswer(@RequestBody UserQuestionHistory record) {
        historyRepository.save(record);
        return ResponseEntity.ok(Map.of("message", "Kaydedildi"));
    }

    // Kullanıcının tüm geçmişini getir
    @GetMapping("/history/{username}")
    public List<UserQuestionHistory> getHistory(@PathVariable String username) {
        return historyRepository.findByUsernameIgnoreCase(username);
    }
}