package com.anteteno.yoprep.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String examCode;

    @Column(nullable = false)
    private String subject;

    @Column
    private Integer questionNumber;

    @Column
    private String questionText;

    @Column
    private String correctAnswer;

    @Column
    private Integer points;

    @Column
    private String difficulty;


}
