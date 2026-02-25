package com.anteteno.yoprep.service;

import com.anteteno.yoprep.entity.Question;
import com.anteteno.yoprep.repository.QuestionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("QuestionServiceTests")
class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionService questionService;

    @Test
    void getAllQuestions_returnsAllQuestions() {
        List<Question> questions = List.of(
                Question.builder().id(1L).subject("mathematics").questionText("Laske 2+2").build(),
                Question.builder().id(2L).subject("physics").questionText("Valon nopeus?").build()
        );
        when(questionRepository.findAll()).thenReturn(questions);

        List<Question> result = questionService.getAllQuestions();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getSubject()).isEqualTo("mathematics");
        verify(questionRepository, times(1)).findAll();
    }

    @Test
    void getAllQuestions_emptyDatabase_returnsEmptyList() {
        when(questionRepository.findAll()).thenReturn(Collections.emptyList());

        List<Question> result = questionService.getAllQuestions();

        assertThat(result).isEmpty();
    }

    @Test
    void getQuestionById_found_returnsQuestion() {
        Question question = Question.builder()
                .id(1L)
                .examCode("pmat_k2025")
                .subject("mathematics")
                .questionText("Derivoi f(x) = 3x^2")
                .build();
        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));

        Question result = questionService.getQuestionById(1L);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getQuestionText()).contains("Derivoi");
    }

    @Test
    void getQuestionById_notFound_throwsException() {
        when(questionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> questionService.getQuestionById(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void createQuestion_savesAndReturnsQuestion() {
        Question input = Question.builder()
                .examCode("pmat_k2025")
                .subject("mathematics")
                .questionNumber(1)
                .questionText("Laske 5 * 7")
                .correctAnswer("35")
                .points(2)
                .difficulty("easy")
                .build();

        Question saved = Question.builder()
                .id(1L)
                .examCode("pmat_k2025")
                .subject("mathematics")
                .questionNumber(1)
                .questionText("Laske 5 * 7")
                .correctAnswer("35")
                .points(2)
                .difficulty("easy")
                .build();

        when(questionRepository.save(any(Question.class))).thenReturn(saved);

        Question result = questionService.createQuestion(input);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getQuestionText()).isEqualTo("Laske 5 * 7");
        verify(questionRepository, times(1)).save(input);
    }

    @Test
    void deleteQuestion_existingId_deletesSuccessfully() {
        when(questionRepository.existsById(1L)).thenReturn(true);

        questionService.deleteQuestion(1L);

        verify(questionRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteQuestion_notFound_throwsException() {
        when(questionRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> questionService.deleteQuestion(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");

        verify(questionRepository, never()).deleteById(any());
    }

    @Test
    void getRandomQuestion_withQuestions_returnsOne() {
        List<Question> questions = List.of(
                Question.builder().id(1L).questionText("Kysymys 1").build(),
                Question.builder().id(2L).questionText("Kysymys 2").build()
        );
        when(questionRepository.findAll()).thenReturn(questions);

        Question result = questionService.getRandomQuestion();

        assertThat(result).isNotNull();
        assertThat(result.getQuestionText()).startsWith("Kysymys");
    }

    @Test
    void getRandomQuestion_emptyDatabase_throwsException() {
        when(questionRepository.findAll()).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> questionService.getRandomQuestion())
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("No questions available");
    }
}
