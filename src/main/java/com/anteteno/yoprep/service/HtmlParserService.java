package com.anteteno.yoprep.service;

import com.anteteno.yoprep.model.Question;
import com.anteteno.yoprep.repository.QuestionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class HtmlParserService {

    private final ObjectMapper objectMapper;
    private final QuestionRepository questionRepository;

    public HtmlParserService(QuestionRepository questionRepository) {
        this.objectMapper = new ObjectMapper();
        this.questionRepository = questionRepository;
    }

    /**
     * Parses YLE Abitreenit HTML file and converts it to JSON
     */
    public String parseHtmlToJson(String htmlFilePath, String examCode, String subject, int year, boolean isSpringExam) throws IOException {
        // Read HTML file
        File htmlFile = new File(htmlFilePath);
        Document doc = Jsoup.parse(htmlFile, "UTF-8");

        // Create root JSON object
        ObjectNode examJson = objectMapper.createObjectNode();
        examJson.put("examCode", examCode);
        examJson.put("subject", subject);
        examJson.put("year", year);
        examJson.put("isSpringExam", isSpringExam);

        // Create questions array
        ArrayNode questionsArray = objectMapper.createArrayNode();

        // Find all main questions (level-0)
        Elements mainQuestions = doc.select(".e-exam-question.e-level-0");

        for (Element mainQuestion : mainQuestions) {
            ObjectNode questionObj = parseMainQuestion(mainQuestion);
            if (questionObj != null) {
                questionsArray.add(questionObj);
            }
        }

        examJson.set("questions", questionsArray);

        // Return pretty-printed JSON
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(examJson);
    }

    private ObjectNode parseMainQuestion(Element mainQuestion) {
        ObjectNode questionObj = objectMapper.createObjectNode();

        // Get question number from data attribute or id
        String questionNumber = extractQuestionNumber(mainQuestion);
        if (questionNumber == null) return null;

        questionObj.put("questionNumber", questionNumber);

        // Parse question title and total points
        Element titleElement = mainQuestion.selectFirst("h3.exam-question-title");
        if (titleElement != null) {
            String title = titleElement.selectFirst("span[lang]") != null ?
                titleElement.selectFirst("span[lang]").text() : "";
            String pointsText = titleElement.selectFirst(".e-score") != null ?
                titleElement.selectFirst(".e-score").text() : "";
            int totalPoints = extractPoints(pointsText);

            questionObj.put("title", title);
            questionObj.put("totalPoints", totalPoints);
        }

        // Parse question instruction
        Element instructionElement = mainQuestion.selectFirst(".exam-question-instruction");
        String instruction = instructionElement != null ? instructionElement.text() : "";

        // Create questionJson object
        ObjectNode questionJson = objectMapper.createObjectNode();
        questionJson.put("text", instruction);
        questionJson.put("type", "multi_part");

        // Parse sub-questions
        ArrayNode partsArray = objectMapper.createArrayNode();
        Elements subQuestions = mainQuestion.select("> .e-exam-question.e-mrg-l-8");

        for (Element subQuestion : subQuestions) {
            ObjectNode partObj = parseSubQuestion(subQuestion);
            if (partObj != null) {
                partsArray.add(partObj);
            }
        }

        questionJson.set("parts", partsArray);
        questionObj.set("questionJson", questionJson);

        // For now, create empty HVP
        ObjectNode hvpJson = objectMapper.createObjectNode();
        questionObj.set("hvpJson", hvpJson);

        return questionObj;
    }

    private ObjectNode parseSubQuestion(Element subQuestion) {
        ObjectNode partObj = objectMapper.createObjectNode();

        // Get part number (e.g., "1.1", "1.2")
        String partNumber = extractQuestionNumber(subQuestion);
        if (partNumber == null) return null;

        partObj.put("partNumber", partNumber);

        // Get question text
        Element titleElement = subQuestion.selectFirst("h4.exam-question-title");
        if (titleElement != null) {
            String questionText = titleElement.selectFirst("span[lang]") != null ?
                titleElement.selectFirst("span[lang]").text() : "";

            // Get formula if exists (from screen reader text)
            Element formulaElement = titleElement.selectFirst(".e-screen-reader-only");
            if (formulaElement != null) {
                questionText += " " + formulaElement.text();
            }

            partObj.put("text", questionText);

            // Get points
            String pointsText = titleElement.selectFirst(".e-score") != null ?
                titleElement.selectFirst(".e-score").text() : "";
            int points = extractPoints(pointsText);
            partObj.put("points", points);
        }

        return partObj;
    }

    private String extractQuestionNumber(Element element) {
        // Try data-toc-id attribute first
        String tocId = element.attr("data-toc-id");
        if (!tocId.isEmpty() && tocId.startsWith("question-")) {
            return tocId.substring("question-".length());
        }

        // Try id attribute
        String id = element.id();
        if (id.startsWith("question-nr-")) {
            return id.substring("question-nr-".length());
        }

        return null;
    }

    private int extractPoints(String pointsText) {
        if (pointsText == null || pointsText.isEmpty()) return 0;

        // Extract number from text like "12 p." or "2 p."
        Pattern pattern = Pattern.compile("(\\d+)\\s*p");
        Matcher matcher = pattern.matcher(pointsText);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return 0;
    }

    public List<Question> parseAndSaveQuestions(
            String htmlFilePath,
            String examCode,
            String subject,
            int year,
            boolean isSpringExam
    ) throws IOException {
        String examString = parseHtmlToJson(htmlFilePath, examCode, subject, year, isSpringExam);

        ObjectNode examJson = (ObjectNode) objectMapper.readTree(examString);
        ArrayNode questionsArray = (ArrayNode) examJson.get("questions");

        List<Question> savedQuestions = new ArrayList<>();

        for(JsonNode questionNode : questionsArray) {
            ObjectNode questionObj = (ObjectNode) questionNode;

            Question q = new Question();

            q.setExamCode(examJson.get("examCode").toString());
            q.setQuestionJson(questionObj);
        }

        return null;
    }
}
