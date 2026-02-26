package com.anteteno.yoprep.controller;

import com.anteteno.yoprep.entity.Submission;
import com.anteteno.yoprep.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public Submission createSubmission(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Long questionId = Long.valueOf(body.get("questionId").toString());
        String answerText = body.get("answerText").toString();
        return submissionService.createSubmission(userId, questionId, answerText);
    }

    @GetMapping("/user/{userId}")
    public List<Submission> getByUser(@PathVariable Long userId) {
        return submissionService.getByUserId(userId);
    }

    @GetMapping("/{id}")
    public Submission getById(@PathVariable Long id) {
        return submissionService.getById(id);
    }
}
