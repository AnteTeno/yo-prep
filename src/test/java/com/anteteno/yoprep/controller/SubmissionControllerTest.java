package com.anteteno.yoprep.controller;

import com.anteteno.yoprep.entity.Question;
import com.anteteno.yoprep.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("SubmissionControllerTests")
class SubmissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Long createTestUser() throws Exception {
        User user = User.builder()
                .username("submitter_" + System.nanoTime())
                .email("submitter_" + System.nanoTime() + "@example.com")
                .password("Password123")
                .build();

        String response = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).get("id").asLong();
    }

    private Long createTestQuestion() throws Exception {
        Question question = Question.builder()
                .subject("mathematics")
                .examCode("math_k2024")
                .questionText("Laske 2+2")
                .correctAnswer("4")
                .points(6)
                .difficulty("easy")
                .build();

        String response = mockMvc.perform(post("/api/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(question)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readTree(response).get("id").asLong();
    }

    @Test
    void createSubmission_returnsSubmissionWithAiFields() throws Exception {
        Long userId = createTestUser();
        Long questionId = createTestQuestion();

        Map<String, Object> body = Map.of(
                "userId", userId,
                "questionId", questionId,
                "answerText", "4"
        );

        mockMvc.perform(post("/api/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.answerText").value("4"))
                .andExpect(jsonPath("$.aiGrade").isNotEmpty())
                .andExpect(jsonPath("$.aiFeedback").isNotEmpty());
    }

    @Test
    void getByUser_returnsList() throws Exception {
        Long userId = createTestUser();

        mockMvc.perform(get("/api/submissions/user/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getById_notFound_returnsError() throws Exception {
        mockMvc.perform(get("/api/submissions/99999"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void loginEndpoint_validCredentials_returnsUser() throws Exception {
        // First create a user
        User user = User.builder()
                .username("logintest_" + System.nanoTime())
                .email("logintest_" + System.nanoTime() + "@example.com")
                .password("SecurePass123")
                .build();

        String createResponse = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String username = objectMapper.readTree(createResponse).get("username").asText();

        // Then login
        Map<String, String> credentials = Map.of(
                "username", username,
                "password", "SecurePass123"
        );

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(username));
    }

    @Test
    void loginEndpoint_wrongPassword_returns401() throws Exception {
        User user = User.builder()
                .username("wrongpw_" + System.nanoTime())
                .email("wrongpw_" + System.nanoTime() + "@example.com")
                .password("CorrectPass123")
                .build();

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk());

        Map<String, String> credentials = Map.of(
                "username", user.getUsername(),
                "password", "WrongPassword"
        );

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(credentials)))
                .andExpect(status().isUnauthorized());
    }
}
