package com.example.englishhapp.controller;

import com.example.englishhapp.model.Question;
import com.example.englishhapp.repository.QuestionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    private final QuestionRepository questionRepository;

    public QuizController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @GetMapping("/start")
    public List<Question> startQuiz(@RequestParam(defaultValue = "all") String category) {
        List<Question> questions;

        if ("all".equalsIgnoreCase(category)) {
            questions = new ArrayList<>(questionRepository.findAll());
        } else {
            questions = new ArrayList<>(questionRepository.findByCategoryIgnoreCase(category));
        }

        if (questions.isEmpty()) {
            return Collections.emptyList();
        }

        // Soruları karıştır
        Collections.shuffle(questions);

        // Tam 10 soru belirle (Havuzda 10'dan az varsa olan kadarını gönderir)
        int targetCount = Math.min(questions.size(), 10);
        return questions.subList(0, targetCount);
    }
}