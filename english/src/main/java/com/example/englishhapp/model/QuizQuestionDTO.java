package com.example.englishhapp.model;

import java.util.List;

public class QuizQuestionDTO {
    private String questionPattern;  // Sorulan kalıp (örn: "How about...?")
    private String example;          // Örnek cümle
    private String correctAnswer;    // Doğru Türkçe anlam
    private List<String> options;    // Karışık 4 şık

    public QuizQuestionDTO() {}

    public QuizQuestionDTO(String questionPattern, String example, String correctAnswer, List<String> options) {
        this.questionPattern = questionPattern;
        this.example = example;
        this.correctAnswer = correctAnswer;
        this.options = options;
    }

    public String getQuestionPattern() { return questionPattern; }
    public void setQuestionPattern(String questionPattern) { this.questionPattern = questionPattern; }

    public String getExample() { return example; }
    public void setExample(String example) { this.example = example; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
}