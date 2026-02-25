package com.anteteno.yoprep.controller;

import com.anteteno.yoprep.entity.Question;
import com.anteteno.yoprep.service.QuestionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("QuestionControllerTests")
class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private QuestionService questionService;

    @Test
    void createQuestion_returnsCreatedQuestion() throws Exception {
        Question question = Question.builder()
                .examCode("pmat_k2025")
                .subject("mathematics")
                .questionNumber(1)
                .questionText("Laske 2 + 2")
                .correctAnswer("4")
                .points(2)
                .difficulty("easy")
                .build();

        mockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(question)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.examCode").value("pmat_k2025"))
                .andExpect(jsonPath("$.subject").value("mathematics"))
                .andExpect(jsonPath("$.questionText").value("Laske 2 + 2"))
                .andExpect(jsonPath("$.correctAnswer").value("4"))
                .andExpect(jsonPath("$.points").value(2))
                .andExpect(jsonPath("$.difficulty").value("easy"));
    }

    @Test
    void getAllQuestions_returnsList() throws Exception {
        questionService.createQuestion(Question.builder()
                .examCode("pfys_k2025")
                .subject("physics")
                .questionNumber(1)
                .questionText("Mikä on valon nopeus?")
                .correctAnswer("299 792 458 m/s")
                .points(2)
                .difficulty("easy")
                .build());

        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void getQuestionById_returnsQuestion() throws Exception {
        Question saved = questionService.createQuestion(Question.builder()
                .examCode("pkem_k2025")
                .subject("chemistry")
                .questionNumber(1)
                .questionText("Mikä on veden kemiallinen kaava?")
                .correctAnswer("H2O")
                .points(2)
                .difficulty("easy")
                .build());

        mockMvc.perform(get("/api/questions/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.subject").value("chemistry"))
                .andExpect(jsonPath("$.questionText").value("Mikä on veden kemiallinen kaava?"));
    }

    @Test
    void getQuestionById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/questions/99999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getRandomQuestion_returnsOneQuestion() throws Exception {
        questionService.createQuestion(Question.builder()
                .examCode("phis_k2025")
                .subject("history")
                .questionNumber(1)
                .questionText("Minä vuonna Suomi itsenäistyi?")
                .correctAnswer("1917")
                .points(2)
                .difficulty("easy")
                .build());

        mockMvc.perform(get("/api/questions/random"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.questionText").isNotEmpty());
    }

    @Test
    void deleteQuestion_returnsSuccessMessage() throws Exception {
        Question saved = questionService.createQuestion(Question.builder()
                .examCode("pmat_s2024")
                .subject("mathematics")
                .questionNumber(5)
                .questionText("Poistettava kysymys")
                .correctAnswer("vastaus")
                .points(3)
                .difficulty("medium")
                .build());

        mockMvc.perform(delete("/api/questions/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Deleted")));

        mockMvc.perform(get("/api/questions/" + saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteQuestion_notFound_returns404() throws Exception {
        mockMvc.perform(delete("/api/questions/99999"))
                .andExpect(status().isNotFound());
    }
}
