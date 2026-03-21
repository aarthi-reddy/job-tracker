package com.aarthi.jobtracker.controller;

import com.aarthi.jobtracker.entity.User;
import com.aarthi.jobtracker.repository.JobApplicationRepository;
import com.aarthi.jobtracker.repository.ResumeRepository;
import com.aarthi.jobtracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ResumeRepository resumeRepository;

    private static final String ADMIN_EMAIL = "aarthireddy.chinnu@gmail.com";

    private boolean isAdmin() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ADMIN_EMAIL.equals(user.getEmail());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
        }

        long totalUsers = userRepository.count();
        long totalApplications = jobApplicationRepository.count();
        long totalDocuments = resumeRepository.count();

        List<Map<String, Object>> userDetails = userRepository.findAll().stream().map(user -> {
            Map<String, Object> info = new LinkedHashMap<>();
            info.put("id", user.getId());
            info.put("email", user.getEmail());
            info.put("fullName", user.getFullName());
            info.put("createdAt", user.getCreatedAt().toString());
            info.put("applicationCount", jobApplicationRepository.countByUserId(user.getId()));
            return info;
        }).collect(Collectors.toList());

        // Status breakdown
        List<Object[]> statusCounts = jobApplicationRepository.countByStatusGrouped();
        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (Object[] row : statusCounts) {
            statusBreakdown.put((String) row[0], (Long) row[1]);
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalApplications", totalApplications);
        stats.put("totalDocuments", totalDocuments);
        stats.put("statusBreakdown", statusBreakdown);
        stats.put("users", userDetails);

        return ResponseEntity.ok(stats);
    }
}