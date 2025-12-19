package com.anteteno.yoprep.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
public class Question {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionJson;

    @Column(columnDefinition = "TEXT")
    private String hvpJson;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String examCode;  // "pmat_k2025"

    @Column(nullable = false)
    private Boolean isSpringExam;

    @Column(nullable = false)
    private Integer examYear;

    @Column(nullable = false)
    private String questionNumber;

    @Column(nullable = false)
    private Integer totalPoints;

    @Column(nullable = false)
    private String sourceUrl;

    private LocalDateTime scrapedAt;

}
