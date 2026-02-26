package com.anteteno.yoprep.service;

import com.anteteno.yoprep.entity.Question;
import com.anteteno.yoprep.entity.Submission;
import com.anteteno.yoprep.entity.User;
import com.anteteno.yoprep.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserService userService;
    private final QuestionService questionService;
    private final AiEvaluationService aiEvaluationService;

    public Submission createSubmission(Long userId, Long questionId, String answerText) {
        User user = userService.getUserById(userId);
        Question question = questionService.getQuestionById(questionId);

        Submission submission = Submission.builder()
                .user(user)
                .question(question)
                .answerText(answerText)
                .build();

        // Get AI evaluation
        AiEvaluationService.EvaluationResult result = aiEvaluationService.evaluateAnswer(question, answerText);
        submission.setAiGrade(result.grade());
        submission.setAiFeedback(result.feedback());
        submission.setAiScore(result.score());

        return submissionRepository.save(submission);
    }

    public List<Submission> getByUserId(Long userId) {
        return submissionRepository.findByUserId(userId);
    }

    public Submission getById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Submission not found with id: " + id));
    }
}
