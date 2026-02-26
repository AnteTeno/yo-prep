package com.anteteno.yoprep.controller;

import com.anteteno.yoprep.entity.Submission;
import com.anteteno.yoprep.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final SubmissionService submissionService;

    @GetMapping("/{userId}")
    public Map<String, Object> getProgress(@PathVariable Long userId) {
        List<Submission> submissions = submissionService.getByUserId(userId);

        Map<String, List<Submission>> bySubject = submissions.stream()
                .collect(Collectors.groupingBy(s -> s.getQuestion().getSubject()));

        List<Map<String, Object>> subjectStats = bySubject.entrySet().stream()
                .map(entry -> {
                    List<Submission> subs = entry.getValue();
                    double avgScore = subs.stream()
                            .filter(s -> s.getAiScore() != null)
                            .mapToInt(Submission::getAiScore)
                            .average()
                            .orElse(0.0);
                    int bestScore = subs.stream()
                            .filter(s -> s.getAiScore() != null)
                            .mapToInt(Submission::getAiScore)
                            .max()
                            .orElse(0);

                    return Map.<String, Object>of(
                            "subject", entry.getKey(),
                            "totalAnswers", subs.size(),
                            "averageScore", Math.round(avgScore * 10.0) / 10.0,
                            "bestScore", bestScore
                    );
                })
                .collect(Collectors.toList());

        return Map.of(
                "userId", userId,
                "totalSubmissions", submissions.size(),
                "subjects", subjectStats
        );
    }
}
