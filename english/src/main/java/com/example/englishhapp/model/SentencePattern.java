package com.example.englishhapp.model;

import jakarta.persistence.*;

@Entity
@Table(name = "patterns")
public class SentencePattern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String pattern;
    private String meaning;
    private String example;
    private String translation;
    private String category;

    // Parametresiz Boş Constructor (JPA için zorunlu)
    public SentencePattern() {
    }

    // Parametreli Constructor (DataLoader için)
    public SentencePattern(Long id, String pattern, String meaning, String example, String translation, String category) {
        this.id = id;
        this.pattern = pattern;
        this.meaning = meaning;
        this.example = example;
        this.translation = translation;
        this.category = category;
    }

    // Getter ve Setter'lar
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public String getMeaning() {
        return meaning;
    }

    public void setMeaning(String meaning) {
        this.meaning = meaning;
    }

    public String getExample() {
        return example;
    }

    public void setExample(String example) {
        this.example = example;
    }

    public String getTranslation() {
        return translation;
    }

    public void setTranslation(String translation) {
        this.translation = translation;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}