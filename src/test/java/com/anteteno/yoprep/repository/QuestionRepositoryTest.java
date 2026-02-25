package com.anteteno.yoprep.repository;

import com.anteteno.yoprep.entity.Question;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("QuestionRepositoryTests")
class QuestionRepositoryTest {

    @Autowired
    private QuestionRepository questionRepository;

    @Test
    void save_persistsQuestionWithGeneratedId() {
        Question saved = questionRepository.save(Question.builder()
                .examCode("pmat_k2025")
                .subject("mathematics")
                .questionNumber(1)
                .questionText("Laske 2 + 2")
                .correctAnswer("4")
                .points(2)
                .difficulty("easy")
                .build());

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getExamCode()).isEqualTo("pmat_k2025");
    }

    @Test
    void findById_returnsSavedQuestion() {
        Question saved = questionRepository.save(Question.builder()
                .examCode("pfys_k2025")
                .subject("physics")
                .questionNumber(1)
                .questionText("Valon nopeus?")
                .correctAnswer("3e8 m/s")
                .points(3)
                .difficulty("easy")
                .build());

        Optional<Question> found = questionRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getSubject()).isEqualTo("physics");
    }

    @Test
    void findById_unknownId_returnsEmpty() {
        assertThat(questionRepository.findById(99999L)).isEmpty();
    }

    @Test
    void findAll_returnsAllQuestions() {
        questionRepository.save(Question.builder()
                .examCode("pmat_k2025").subject("mathematics")
                .questionNumber(1).questionText("Kysymys 1").build());
        questionRepository.save(Question.builder()
                .examCode("pfys_k2025").subject("physics")
                .questionNumber(1).questionText("Kysymys 2").build());

        assertThat(questionRepository.findAll()).hasSize(2);
    }

    @Test
    void deleteById_removesQuestion() {
        Question saved = questionRepository.save(Question.builder()
                .examCode("pkem_k2025").subject("chemistry")
                .questionNumber(1).questionText("Poistettava").build());

        questionRepository.deleteById(saved.getId());

        assertThat(questionRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    void allFieldsPersistedCorrectly() {
        Question saved = questionRepository.save(Question.builder()
                .examCode("pmat_s2024")
                .subject("mathematics")
                .questionNumber(3)
                .questionText("Derivoi f(x) = 3x^2 + 2x - 1")
                .correctAnswer("f'(x) = 6x + 2")
                .points(6)
                .difficulty("hard")
                .build());

        Question found = questionRepository.findById(saved.getId()).orElseThrow();

        assertThat(found.getExamCode()).isEqualTo("pmat_s2024");
        assertThat(found.getSubject()).isEqualTo("mathematics");
        assertThat(found.getQuestionNumber()).isEqualTo(3);
        assertThat(found.getQuestionText()).contains("Derivoi");
        assertThat(found.getCorrectAnswer()).contains("6x + 2");
        assertThat(found.getPoints()).isEqualTo(6);
        assertThat(found.getDifficulty()).isEqualTo("hard");
    }
}
