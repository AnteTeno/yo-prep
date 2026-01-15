package com.anteteno.yoprep.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;

@Entity
@Table(name = "useranswer")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAnswer {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "questionId", nullable = false)
    private Question question;

    @Column(nullable = false)
    private String userAnswer;

    @Column(nullable = false)
    private Boolean isCorrect;


    private LocalDateTime answererdAt;

    @PrePersist
    protected void onCreate() {
        answererdAt = LocalDateTime.now();
    }


}
