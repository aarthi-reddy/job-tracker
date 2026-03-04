package com.aarthi.jobtracker.service;

import com.aarthi.jobtracker.dto.JobApplicationRequest;
import com.aarthi.jobtracker.dto.JobApplicationResponse;
import com.aarthi.jobtracker.entity.JobApplication;
import com.aarthi.jobtracker.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public JobApplicationResponse createApplication(JobApplicationRequest request) {
        JobApplication app = new JobApplication();
        app.setCompany(request.getCompany());
        app.setRole(request.getRole());
        app.setStatus(request.getStatus() != null ? request.getStatus() : "APPLIED");
        app.setJobUrl(request.getJobUrl());
        app.setNotes(request.getNotes());

        if (request.getAppliedDate() != null) {
            app.setAppliedDate(LocalDateTime.parse(request.getAppliedDate(), FORMATTER));
        }

        JobApplication saved = repository.save(app);
        return mapToResponse(saved);
    }

    public List<JobApplicationResponse> getAllApplications() {
        return repository.findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public JobApplicationResponse getApplicationById(Long id) {
        JobApplication app = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        return mapToResponse(app);
    }

    public JobApplicationResponse updateApplication(Long id, JobApplicationRequest request) {
        JobApplication app = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));

        if (request.getCompany() != null) app.setCompany(request.getCompany());
        if (request.getRole() != null) app.setRole(request.getRole());
        if (request.getStatus() != null) app.setStatus(request.getStatus());
        if (request.getJobUrl() != null) app.setJobUrl(request.getJobUrl());
        if (request.getNotes() != null) app.setNotes(request.getNotes());

        JobApplication saved = repository.save(app);
        return mapToResponse(saved);
    }

    public void deleteApplication(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Application not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public List<JobApplicationResponse> getByStatus(String status) {
        return repository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobApplicationResponse> searchByCompany(String company) {
        return repository.findByCompanyContainingIgnoreCase(company)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private JobApplicationResponse mapToResponse(JobApplication app) {
        return JobApplicationResponse.builder()
                .id(app.getId())
                .company(app.getCompany())
                .role(app.getRole())
                .status(app.getStatus())
                .jobUrl(app.getJobUrl())
                .notes(app.getNotes())
                .appliedDate(app.getAppliedDate().format(FORMATTER))
                .updatedAt(app.getUpdatedAt().format(FORMATTER))
                .createdAt(app.getCreatedAt().format(FORMATTER))
                .build();
    }
}