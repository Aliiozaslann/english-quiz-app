package com.example.englishhapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_question_history")
public class UserQuestionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String category; // all, business, academic, idioms, tech, travel, debate
    private boolean correct;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(columnDefinition = "TEXT")
    private String chosenAnswer;

    @Column(columnDefinition = "TEXT")
    private String correctAnswer;

    private LocalDateTime answeredAt = LocalDateTime.now();

    public UserQuestionHistory() {}

    public UserQuestionHistory(String username, String category, boolean correct, String prompt, String chosenAnswer, String correctAnswer) {
        this.username = username;
        this.category = category;
        this.correct = correct;
        this.prompt = prompt;
        this.chosenAnswer = chosenAnswer;
        this.correctAnswer = correctAnswer;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getCategory() { return category; }
    public boolean isCorrect() { return correct; }
    public String getPrompt() { return prompt; }
    public String getChosenAnswer() { return chosenAnswer; }
    public String getCorrectAnswer() { return correctAnswer; }
    public LocalDateTime getAnsweredAt() { return answeredAt; }
}