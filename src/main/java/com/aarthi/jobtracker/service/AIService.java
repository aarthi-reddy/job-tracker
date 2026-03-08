package com.aarthi.jobtracker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIService {

    private final WebClient groqWebClient;

    private String callAI(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 1024
        );

        try {
            Map response = groqWebClient.post()
                    .uri("/openai/v1/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "AI service error: " + e.getMessage();
        }
    }

    public String getResumeFeedback(String resumeText, String targetRole) {
        String prompt = "You are an expert tech recruiter who has reviewed thousands of resumes for FAANG companies. "
                + "Review this resume for a " + targetRole + " position and provide: "
                + "1. Overall score (1-10) "
                + "2. Top 3 strengths "
                + "3. Top 3 areas for improvement "
                + "4. Specific suggestions to make it more competitive for top tech companies "
                + "5. Keywords that are missing. "
                + "Keep your response concise and actionable. "
                + "Resume: " + resumeText;

        return callAI(prompt);
    }

    public String generateCoverLetter(String company, String role, String resumeText) {
        String prompt = "You are an expert career coach specializing in tech industry applications. "
                + "Write a compelling cover letter for a " + role + " position at " + company + ". "
                + "The cover letter should: "
                + "- Be professional but show personality "
                + "- Highlight relevant experience from the resume "
                + "- Show knowledge of the company "
                + "- Be concise (under 300 words) "
                + "- Not be generic, make it specific to this company and role. "
                + "Resume for context: " + resumeText;

        return callAI(prompt);
    }

    public String generateInterviewQuestions(String company, String role) {
        String prompt = "You are a senior interviewer at " + company + " hiring for a " + role + " position. "
                + "Generate a realistic interview preparation guide with: "
                + "1. 5 behavioral questions commonly asked at " + company + " "
                + "2. 3 technical questions relevant to this role "
                + "3. 2 system design questions if applicable "
                + "4. Tips specific to " + company + "'s interview process "
                + "5. What " + company + " looks for in candidates. "
                + "Make this specific to " + company + ", not generic interview advice.";

        return callAI(prompt);
    }
}