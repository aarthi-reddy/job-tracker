package com.aarthi.jobtracker.controller;

import com.aarthi.jobtracker.service.AIService;
import com.aarthi.jobtracker.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;
    private final ResumeService resumeService;

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

    @PostMapping("/upload-resume")
    public ResponseEntity<Map<String, String>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetRole") String targetRole) {
        try {
            String feedback = resumeService.analyzeResume(file, targetRole);
            return ResponseEntity.ok(Map.of("feedback", feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to process resume: " + e.getMessage()));
        }
    }

    @PostMapping("/upload-resume-cover-letter")
    public ResponseEntity<Map<String, String>> uploadResumeForCoverLetter(
            @RequestParam("file") MultipartFile file,
            @RequestParam("company") String company,
            @RequestParam("role") String role) {
        try {
            String coverLetter = resumeService.generateCoverLetter(file, company, role);
            return ResponseEntity.ok(Map.of("coverLetter", coverLetter));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to process resume: " + e.getMessage()));
        }
    }
}