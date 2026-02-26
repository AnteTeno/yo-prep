package com.anteteno.yoprep.service;

import com.anteteno.yoprep.entity.Question;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("AiEvaluationServiceTests")
class AiEvaluationServiceTest {

    private AiEvaluationService aiEvaluationService;

    @BeforeEach
    void setUp() {
        // Create service with empty API key - calls will fail gracefully
        aiEvaluationService = new AiEvaluationService("", new ObjectMapper());
    }

    @Test
    void evaluateAnswer_withoutApiKey_returnsFallback() {
        Question question = Question.builder()
                .id(1L)
                .subject("mathematics")
                .examCode("math_k2024")
                .questionText("Laske 2+2")
                .points(6)
                .build();

        AiEvaluationService.EvaluationResult result = aiEvaluationService.evaluateAnswer(question, "4");

        // Without a valid API key, the service should return a fallback result
        assertThat(result).isNotNull();
        assertThat(result.grade()).isNotNull();
        assertThat(result.feedback()).isNotNull();
    }

    @Test
    void evaluateAnswer_emptyAnswer_returnsFallback() {
        Question question = Question.builder()
                .id(1L)
                .subject("english")
                .examCode("english_k2024")
                .questionText("Translate: Hello")
                .points(3)
                .build();

        AiEvaluationService.EvaluationResult result = aiEvaluationService.evaluateAnswer(question, "");

        assertThat(result).isNotNull();
        assertThat(result.grade()).isNotNull();
    }
}
