package com.anteteno.yoprep.service;


import com.anteteno.yoprep.entity.Question;
import com.anteteno.yoprep.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Random;


@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;


    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }


    public Question getQuestionById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Question not found with id: "+id));
    }


    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }


    public void deleteQuestion(Long id) {
        if(!questionRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found with id: "+id);
        }
        questionRepository.deleteById(id);
    }


    public Question getRandomQuestion() {
        List<Question> questions = questionRepository.findAll();

        if(questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No questions available");
        }

        Random random = new Random();

        int randomIndex = random.nextInt(questions.size());

        return questions.get(randomIndex);
    }


}
