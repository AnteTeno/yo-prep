package com.anteteno.yoprep.repository;

import com.anteteno.yoprep.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByUserId(Long userId);

    List<Submission> findByUserIdAndQuestionId(Long userId, Long questionId);
}
