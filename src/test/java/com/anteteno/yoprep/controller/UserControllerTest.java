package com.anteteno.yoprep.controller;

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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("UserControllerTests")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createUser_returnsCreatedUser() throws Exception {
        User user = User.builder()
                .username("testaaja1")
                .email("testaaja1@example.com")
                .password("SalainenSana123")
                .build();

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.username").value("testaaja1"))
                .andExpect(jsonPath("$.email").value("testaaja1@example.com"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    void createUser_passwordIsHashed() throws Exception {
        User user = User.builder()
                .username("hashtest")
                .email("hashtest@example.com")
                .password("PlainTextPassword")
                .build();

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").value(not("PlainTextPassword")));
    }

    @Test
    void createUser_duplicateUsername_returns400() throws Exception {
        User user1 = User.builder().username("duplicate_user").email("first@example.com").password("Password123").build();
        User user2 = User.builder().username("duplicate_user").email("second@example.com").password("Password456").build();

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user2)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createUser_duplicateEmail_returns400() throws Exception {
        User user1 = User.builder().username("user_a").email("sama@example.com").password("Password123").build();
        User user2 = User.builder().username("user_b").email("sama@example.com").password("Password456").build();

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user2)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllUsers_returnsList() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getUserById_returnsUser() throws Exception {
        User user = User.builder().username("findme").email("findme@example.com").password("Password123").build();

        String response = mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andReturn().getResponse().getContentAsString();

        Long userId = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(get("/api/users/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("findme"))
                .andExpect(jsonPath("$.email").value("findme@example.com"));
    }

    @Test
    void getUserById_notFound_returnsError() throws Exception {
        mockMvc.perform(get("/api/users/99999"))
                .andExpect(status().is4xxClientError());
    }
}
