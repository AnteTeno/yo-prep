package com.anteteno.yoprep.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answerText;

    private LocalDateTime submittedAt;

    private String aiGrade;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    private Integer aiScore;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
