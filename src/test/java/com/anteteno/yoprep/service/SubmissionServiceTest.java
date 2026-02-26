package com.anteteno.yoprep.service;

import com.anteteno.yoprep.entity.Question;
import com.anteteno.yoprep.entity.Submission;
import com.anteteno.yoprep.entity.User;
import com.anteteno.yoprep.repository.SubmissionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubmissionServiceTests")
class SubmissionServiceTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private UserService userService;

    @Mock
    private QuestionService questionService;

    @Mock
    private AiEvaluationService aiEvaluationService;

    @InjectMocks
    private SubmissionService submissionService;

    @Test
    void createSubmission_savesWithAiEvaluation() {
        User user = User.builder().id(1L).username("testi").build();
        Question question = Question.builder()
                .id(1L).subject("mathematics").questionText("1+1=?").points(6).examCode("math_k2024")
                .build();

        when(userService.getUserById(1L)).thenReturn(user);
        when(questionService.getQuestionById(1L)).thenReturn(question);
        when(aiEvaluationService.evaluateAnswer(any(Question.class), any(String.class)))
                .thenReturn(new AiEvaluationService.EvaluationResult("m", "Hyva vastaus", 5));
        when(submissionRepository.save(any(Submission.class))).thenAnswer(invocation -> {
            Submission s = invocation.getArgument(0);
            s.setId(1L);
            return s;
        });

        Submission result = submissionService.createSubmission(1L, 1L, "2");

        assertThat(result.getAiGrade()).isEqualTo("m");
        assertThat(result.getAiFeedback()).isEqualTo("Hyva vastaus");
        assertThat(result.getAiScore()).isEqualTo(5);
        assertThat(result.getAnswerText()).isEqualTo("2");
    }

    @Test
    void getByUserId_returnsList() {
        List<Submission> subs = List.of(
                Submission.builder().id(1L).build(),
                Submission.builder().id(2L).build()
        );
        when(submissionRepository.findByUserId(1L)).thenReturn(subs);

        List<Submission> result = submissionService.getByUserId(1L);

        assertThat(result).hasSize(2);
    }

    @Test
    void getById_found_returnsSubmission() {
        Submission sub = Submission.builder().id(1L).answerText("vastaus").build();
        when(submissionRepository.findById(1L)).thenReturn(Optional.of(sub));

        Submission result = submissionService.getById(1L);

        assertThat(result.getAnswerText()).isEqualTo("vastaus");
    }

    @Test
    void getById_notFound_throwsException() {
        when(submissionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> submissionService.getById(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Submission not found");
    }
}
