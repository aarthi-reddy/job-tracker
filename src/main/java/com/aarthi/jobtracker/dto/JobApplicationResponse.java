package com.aarthi.jobtracker.dto;

import lombok.Builder;
import lombok.Data;

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
}