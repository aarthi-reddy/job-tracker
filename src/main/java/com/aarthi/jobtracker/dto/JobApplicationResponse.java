package com.aarthi.jobtracker.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class JobApplicationResponse {

    private Long id;
    private String company;
    private String role;
    private String status;
    private String jobUrl;
    private String notes;
    private String appliedDate;
    private String updatedAt;
    private String createdAt;
    private List<ResumeInfo> documents;

    @Data
    @Builder
    public static class ResumeInfo {
        private Long id;
        private String fileName;
        private String fileType;
        private String uploadedAt;
    }
}