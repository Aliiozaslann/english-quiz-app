package com.example.englishhapp.controller;

import com.example.englishhapp.model.QuizQuestionDTO;
import com.example.englishhapp.model.SentencePattern;
import com.example.englishhapp.repository.PatternRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/patterns")
@CrossOrigin(origins = "*")
public class PatternController {

    private final PatternRepository repository;

    public PatternController(PatternRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/quiz")
    public QuizQuestionDTO getQuizQuestion() {
        List<SentencePattern> all = repository.findAll();
        if (all.size() < 4) {
            return null; // En az 4 kalıp olmalı
        }

        // Rastgele 1 doğru soru seç
        Random random = new Random();
        SentencePattern target = all.get(random.nextInt(all.size()));

        // Geri kalanlardan 3 farklı yanlış seçenek topla
        Set<String> optionSet = new HashSet<>();
        optionSet.add(target.getMeaning());

        while (optionSet.size() < 4) {
            SentencePattern distractor = all.get(random.nextInt(all.size()));
            optionSet.add(distractor.getMeaning());
        }

        List<String> shuffledOptions = new ArrayList<>(optionSet);
        Collections.shuffle(shuffledOptions); // Şıkların yerini karıştır

        return new QuizQuestionDTO(
                target.getPattern(),
                target.getExample(),
                target.getMeaning(),
                shuffledOptions
        );
    }
}