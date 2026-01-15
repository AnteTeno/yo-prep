package com.anteteno.yoprep.repository;

import com.anteteno.yoprep.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
