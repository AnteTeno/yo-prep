package com.anteteno.yoprep.service;

import com.anteteno.yoprep.entity.Question;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class AiEvaluationService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public AiEvaluationService(@Value("${anthropic.api-key:}") String apiKey, ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.anthropic.com")
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", "2023-06-01")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public record EvaluationResult(String grade, String feedback, int score) {}

    public EvaluationResult evaluateAnswer(Question question, String answerText) {
        String prompt = buildPrompt(question, answerText);

        Map<String, Object> requestBody = Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 1024,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        try {
            String response = webClient.post()
                    .uri("/v1/messages")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseResponse(response);
        } catch (Exception e) {
            return new EvaluationResult("?", "Arviointi ei onnistunut: " + e.getMessage(), 0);
        }
    }

    private String buildPrompt(Question question, String answerText) {
        return """
                Olet ylioppilaskokeen arvioija. Arvioi seuraava vastaus.

                Aine: %s
                Koe: %s
                Kysymys: %s
                Maksimipisteet: %d

                Opiskelijan vastaus:
                %s

                Vastaa JSON-muodossa (ei muuta tekstiä):
                {
                  "grade": "<arvosana: i/a/b/c/m/l>",
                  "score": <pisteet 0-%d>,
                  "feedback": "<lyhyt palaute suomeksi, max 3 lausetta: vahvuudet, heikkoudet, parannusehdotukset>"
                }
                """.formatted(
                question.getSubject(),
                question.getExamCode(),
                question.getQuestionText(),
                question.getPoints(),
                answerText,
                question.getPoints()
        );
    }

    private EvaluationResult parseResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String text = root.get("content").get(0).get("text").asText();

            // Extract JSON from response (handle possible markdown code blocks)
            String jsonText = text;
            if (text.contains("```")) {
                jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
            }

            JsonNode result = objectMapper.readTree(jsonText);
            return new EvaluationResult(
                    result.get("grade").asText(),
                    result.get("feedback").asText(),
                    result.get("score").asInt()
            );
        } catch (Exception e) {
            return new EvaluationResult("?", "Arvioinnin jäsentäminen epäonnistui", 0);
        }
    }
}
