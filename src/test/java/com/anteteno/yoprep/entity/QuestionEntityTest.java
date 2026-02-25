package com.anteteno.yoprep.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("QuestionEntityTests")
class QuestionEntityTest {

    @Test
    void builderCreatesCompleteQuestion() {
        Question question = Question.builder()
                .id(1L)
                .examCode("pmat_k2025")
                .subject("mathematics")
                .questionNumber(3)
                .questionText("Derivoi f(x) = 3x^2")
                .correctAnswer("f'(x) = 6x")
                .points(6)
                .difficulty("hard")
                .build();

        assertThat(question.getId()).isEqualTo(1L);
        assertThat(question.getExamCode()).isEqualTo("pmat_k2025");
        assertThat(question.getSubject()).isEqualTo("mathematics");
        assertThat(question.getQuestionNumber()).isEqualTo(3);
        assertThat(question.getQuestionText()).isEqualTo("Derivoi f(x) = 3x^2");
        assertThat(question.getCorrectAnswer()).isEqualTo("f'(x) = 6x");
        assertThat(question.getPoints()).isEqualTo(6);
        assertThat(question.getDifficulty()).isEqualTo("hard");
    }

    @ParameterizedTest(name = "examCode \"{0}\" noudattaa nimeämiskonventiota")
    @ValueSource(strings = {"pmat_k2025", "pfys_k2025", "pkem_k2025", "peng_k2025", "phis_s2024"})
    void examCodeFollowsNamingConvention(String examCode) {
        assertThat(examCode).matches("[a-z]+_[ks]\\d{4}");
    }

    @ParameterizedTest(name = "Kausi \"{1}\" parsitaan oikein koetunnuksesta \"{0}\"")
    @CsvSource({
        "pmat_k2025, k, kevät",
        "pfys_s2024, s, syksy"
    })
    void examCodeContainsCorrectSeason(String examCode, String seasonCode, String seasonName) {
        String parsed = examCode.split("_")[1].substring(0, 1);
        assertThat(parsed).isEqualTo(seasonCode);
    }

    @ParameterizedTest(name = "Vaikeustaso \"{0}\" on validi")
    @ValueSource(strings = {"easy", "medium", "hard"})
    void validDifficultyLevels(String difficulty) {
        Question question = Question.builder()
                .difficulty(difficulty)
                .build();

        assertThat(question.getDifficulty()).isIn("easy", "medium", "hard");
    }

    @ParameterizedTest(name = "Vaikeustaso \"{0}\" antaa {1} pistettä")
    @CsvSource({
        "easy, 2",
        "medium, 4",
        "hard, 6"
    })

    void pointsCorrespondToDifficulty(String difficulty, int expectedPoints) {
        Question question = Question.builder()
                .difficulty(difficulty)
                .points(expectedPoints)
                .build();

        assertThat(question.getPoints()).isEqualTo(expectedPoints);
    }

    @Test
    void equalsWorksCorrectly() {
        Question q1 = Question.builder().id(1L).subject("math").build();
        Question q2 = Question.builder().id(1L).subject("math").build();

        assertThat(q1).isEqualTo(q2);
    }

    @Test
    void notEqualsWithDifferentId() {
        Question q1 = Question.builder().id(1L).subject("math").build();
        Question q2 = Question.builder().id(2L).subject("math").build();

        assertThat(q1).isNotEqualTo(q2);
    }
}
