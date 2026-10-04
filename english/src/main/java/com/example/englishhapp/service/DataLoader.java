package com.example.englishhapp.service;

import com.example.englishhapp.model.Question;
import com.example.englishhapp.repository.QuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final QuestionRepository questionRepository;

    public DataLoader(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) {
        List<String> categories = Arrays.asList(
                "business",
                "academic",
                "idioms",
                "tech",
                "travel",
                "vocabulary",
                "kitchen",
                "daily"
        );

        for (String category : categories) {
            // Eğer veritabanında bu kategoride soru yoksa dosyadan yükle
            if (questionRepository.findByCategoryIgnoreCase(category).isEmpty()) {
                loadQuestions(category);
            }
        }
    }

    private void loadQuestions(String category) {
        String fileName = category + ".txt";
        ClassPathResource resource = new ClassPathResource("questions/" + fileName);

        if (!resource.exists()) {
            resource = new ClassPathResource(fileName);
        }

        if (!resource.exists()) {
            System.err.println("❌ DOSYA BULUNAMADI: " + fileName + " (Lütfen dosyanın resources veya resources/questions altında olduğundan emin olun)");
            return;
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            List<Question> questions = new ArrayList<>();

            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                String[] parts = line.split("\\|");

                // 7 parça varsa: type | prompt | correct | optA | optB | optC | optD
                if (parts.length >= 7) {
                    String qType = parts[0].trim();
                    String prompt = parts[1].trim();
                    String correct = parts[2].trim();
                    List<String> opts = new ArrayList<>(Arrays.asList(
                            parts[3].trim(),
                            parts[4].trim(),
                            parts[5].trim(),
                            parts[6].trim()
                    ));
                    Collections.shuffle(opts);
                    questions.add(new Question(category, qType, prompt, correct, opts));
                }
                // 6 parça varsa (vocabulary formatı: type | prompt | correct | wrong1 | wrong2 | wrong3)
                else if (parts.length >= 6) {
                    String qType = parts[0].trim();
                    String prompt = parts[1].trim();
                    String correct = parts[2].trim();
                    List<String> opts = new ArrayList<>(Arrays.asList(
                            correct,
                            parts[3].trim(),
                            parts[4].trim(),
                            parts[5].trim()
                    ));
                    // Şıkları rastgele karıştır ki doğru cevap hep A şıkkı olmasın
                    Collections.shuffle(opts);
                    questions.add(new Question(category, qType, prompt, correct, opts));
                }
            }

            if (!questions.isEmpty()) {
                questionRepository.saveAll(questions);
                System.out.println("✅ " + category + " kategorisinden " + questions.size() + " soru başarıyla yüklendi.");
            } else {
                System.err.println("⚠️ " + category + ".txt okundu ancak geçerli soru satırı bulunamadı!");
            }

        } catch (Exception e) {
            System.err.println("❌ Yükleme Hatası (" + category + "): " + e.getMessage());
        }
    }
}