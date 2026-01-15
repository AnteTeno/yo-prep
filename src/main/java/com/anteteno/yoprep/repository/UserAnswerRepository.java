package com.anteteno.yoprep.repository;

import com.anteteno.yoprep.entity.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {

    List<UserAnswer> findByUserId(Long userId);
    List<UserAnswer> findByUserIdAndQuestionId(Long userId, Long questionId);
}
