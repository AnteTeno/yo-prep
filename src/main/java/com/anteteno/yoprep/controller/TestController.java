package com.anteteno.yoprep.controller;

import com.anteteno.yoprep.service.HtmlParserService;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/test")
public class TestController {



    @Autowired
    private HtmlParserService htmlParserService;



    @GetMapping("/parse")
    public String testHtmlParser() {
        try {
            String htmlPath = "src/main/resources/data/readthis.html";
            String json = htmlParserService.parseHtmlToJson(
                htmlPath,
                "pmat_k2025",
                "matematiikka_pitka",
                2025,
                true
            );

            return json;

        } catch (IOException e) {
            return "Error: " + e.getMessage();
        }
    }
}
