package com.aarthi.jobtracker.controller;

import com.aarthi.jobtracker.service.AIService;
import com.aarthi.jobtracker.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
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

    @PostMapping("/extract-job")
    public ResponseEntity<Map<String, String>> extractJob(@RequestBody Map<String, String> request) {
        String result = aiService.extractJobDetails(request.get("jobDescription"));
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PostMapping("/extract-job-url")
    public ResponseEntity<Map<String, String>> extractJobFromUrl(@RequestBody Map<String, String> request) {
        String result = aiService.fetchAndExtractJob(request.get("url"));
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PostMapping("/job-match")
    public ResponseEntity<?> getJobMatches(@RequestBody Map<String, String> request) {
        String resumeText = request.get("resumeText");
        String prompt = "Analyze this resume and suggest the top 8 job titles that best match this person's skills and experience. "
                + "For each job, provide: job title, why it's a match, and estimated salary range. "
                + "Respond ONLY in this JSON format, no other text:\n"
                + "[{\"title\": \"...\", \"match_reason\": \"...\", \"salary_range\": \"...\", \"search_keywords\": \"...\"}]\n\n"
                + "Resume:\n" + resumeText;
        String result = aiService.askGroq(prompt);
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PostMapping("/skill-gap")
    public ResponseEntity<?> getSkillGap(@RequestBody Map<String, String> request) {
        String resumeText = request.get("resumeText");
        String jobDescription = request.get("jobDescription");
        String prompt = "Compare this resume against the job description. Provide a detailed skill gap analysis. "
                + "Respond ONLY in this JSON format, no other text:\n"
                + "{\"match_percentage\": 85, \"matching_skills\": [\"Java\", \"Spring Boot\"], "
                + "\"missing_skills\": [\"Kubernetes\", \"AWS\"], "
                + "\"recommendations\": [\"Take AWS certification\", \"Learn Docker\"], "
                + "\"summary\": \"Strong backend match but needs cloud skills\"}\n\n"
                + "Resume:\n" + resumeText + "\n\nJob Description:\n" + jobDescription;
        String result = aiService.askGroq(prompt);
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PostMapping("/resume-score")
    public ResponseEntity<?> getResumeScore(@RequestBody Map<String, String> request) {
        String resumeText = request.get("resumeText");
        String prompt = "Score this resume out of 100 and provide detailed feedback. "
                + "Evaluate: content quality, formatting suggestions, keyword optimization, impact statements, and ATS compatibility. "
                + "Respond ONLY in this JSON format, no other text:\n"
                + "{\"overall_score\": 75, \"categories\": ["
                + "{\"name\": \"Content Quality\", \"score\": 80, \"feedback\": \"...\"}, "
                + "{\"name\": \"Keywords & ATS\", \"score\": 70, \"feedback\": \"...\"}, "
                + "{\"name\": \"Impact Statements\", \"score\": 65, \"feedback\": \"...\"}, "
                + "{\"name\": \"Format & Structure\", \"score\": 85, \"feedback\": \"...\"}, "
                + "{\"name\": \"Overall Impression\", \"score\": 75, \"feedback\": \"...\"}], "
                + "\"top_improvements\": [\"...\", \"...\", \"...\"]}\n\n"
                + "Resume:\n" + resumeText;
        String result = aiService.askGroq(prompt);
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PostMapping("/ats-score")
    public ResponseEntity<?> getAtsScore(@RequestBody Map<String, String> request) {
        String resumeText = request.get("resumeText");
        String jobDescription = request.get("jobDescription");
        String prompt = "You are an ATS (Applicant Tracking System) scanner. Analyze this resume against the job description. "
                + "Score how well the resume matches the job requirements. "
                + "Respond ONLY in this JSON format, no other text:\n"
                + "{\"ats_score\": 72, "
                + "\"matched_keywords\": [\"Java\", \"Spring Boot\", \"REST API\"], "
                + "\"missing_keywords\": [\"Kubernetes\", \"CI/CD\", \"Terraform\"], "
                + "\"section_scores\": ["
                + "{\"section\": \"Technical Skills\", \"score\": 85, \"feedback\": \"...\"}, "
                + "{\"section\": \"Work Experience\", \"score\": 70, \"feedback\": \"...\"}, "
                + "{\"section\": \"Projects\", \"score\": 65, \"feedback\": \"...\"}, "
                + "{\"section\": \"Education\", \"score\": 90, \"feedback\": \"...\"}], "
                + "\"improvements\": [\"Add Kubernetes experience\", \"Quantify achievements with metrics\"], "
                + "\"summary\": \"Good technical match but missing cloud-native keywords\"}\n\n"
                + "Resume:\n" + resumeText + "\n\nJob Description:\n" + jobDescription;
        String result = aiService.askGroq(prompt);
        return ResponseEntity.ok(Map.of("result", result));
    }

    @PostMapping("/tailor-resume")
    public ResponseEntity<?> tailorResume(@RequestBody Map<String, String> request) {
        String resumeText = request.get("resumeText");
        String jobDescription = request.get("jobDescription");
        String prompt = "You are an expert resume writer. Rewrite this resume to be perfectly tailored for the given job description. "
                + "Keep all real experiences but reword bullet points to match the job requirements and include relevant keywords. "
                + "Respond ONLY in this JSON format, no other text:\n"
                + "{\"tailored_summary\": \"Rewritten professional summary...\", "
                + "\"tailored_experience\": ["
                + "{\"original\": \"Original bullet point\", \"tailored\": \"Rewritten bullet point with job keywords\"}], "
                + "\"tailored_skills\": [\"Skill 1\", \"Skill 2\"], "
                + "\"keywords_added\": [\"keyword1\", \"keyword2\"], "
                + "\"before_score\": 62, "
                + "\"after_score\": 91, "
                + "\"tips\": [\"tip1\", \"tip2\"]}\n\n"
                + "Resume:\n" + resumeText + "\n\nJob Description:\n" + jobDescription;
        String result = aiService.askGroq(prompt);
        return ResponseEntity.ok(Map.of("result", result));
    }
}