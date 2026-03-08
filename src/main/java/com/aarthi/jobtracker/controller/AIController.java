package com.aarthi.jobtracker.controller;

import com.aarthi.jobtracker.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;

    @PostMapping("/resume-feedback")
    public ResponseEntity<Map<String, String>> resumeFeedback(@RequestBody Map<String, String> request) {
        String feedback = aiService.getResumeFeedback(
                request.get("resumeText"),
                request.get("targetRole")
        );
        return ResponseEntity.ok(Map.of("feedback", feedback));
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<Map<String, String>> coverLetter(@RequestBody Map<String, String> request) {
        String letter = aiService.generateCoverLetter(
                request.get("company"),
                request.get("role"),
                request.get("resumeText")
        );
        return ResponseEntity.ok(Map.of("coverLetter", letter));
    }

    @PostMapping("/interview-questions")
    public ResponseEntity<Map<String, String>> interviewQuestions(@RequestBody Map<String, String> request) {
        String questions = aiService.generateInterviewQuestions(
                request.get("company"),
                request.get("role")
        );
        return ResponseEntity.ok(Map.of("questions", questions));
    }
}