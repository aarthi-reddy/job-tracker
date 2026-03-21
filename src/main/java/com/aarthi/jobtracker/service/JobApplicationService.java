package com.aarthi.jobtracker.service;

import com.aarthi.jobtracker.dto.JobApplicationRequest;
import com.aarthi.jobtracker.dto.JobApplicationResponse;
import com.aarthi.jobtracker.entity.JobApplication;
import com.aarthi.jobtracker.entity.User;
import com.aarthi.jobtracker.entity.Resume;
import com.aarthi.jobtracker.repository.JobApplicationRepository;
import com.aarthi.jobtracker.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final EmailService emailService;
    private final ResumeRepository resumeRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public JobApplicationResponse createApplication(JobApplicationRequest request) {
        User currentUser = getCurrentUser();
        JobApplication app = new JobApplication();
        app.setCompany(request.getCompany());
        app.setRole(request.getRole());
        app.setStatus(request.getStatus() != null ? request.getStatus() : "APPLIED");
        app.setJobUrl(request.getJobUrl());
        app.setNotes(request.getNotes());
        app.setUser(currentUser);

        if (request.getAppliedDate() != null) {
            app.setAppliedDate(LocalDateTime.parse(request.getAppliedDate(), FORMATTER));
        }

        JobApplication saved = repository.save(app);
        emailService.sendNewApplicationEmail(getCurrentUser().getEmail(), saved.getCompany(), saved.getRole());        return mapToResponse(saved);
    }

    public List<JobApplicationResponse> getAllApplications() {
        User currentUser = getCurrentUser();
        return repository.findByUserIdOrderByUpdatedAtDesc(currentUser.getId())
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

        String oldStatus = app.getStatus();

        if (request.getCompany() != null) app.setCompany(request.getCompany());
        if (request.getRole() != null) app.setRole(request.getRole());
        if (request.getStatus() != null) app.setStatus(request.getStatus());
        if (request.getJobUrl() != null) app.setJobUrl(request.getJobUrl());
        if (request.getNotes() != null) app.setNotes(request.getNotes());

        JobApplication saved = repository.save(app);

        if (request.getStatus() != null && !oldStatus.equals(saved.getStatus())) {
            emailService.sendStatusUpdateEmail(getCurrentUser().getEmail(), saved.getCompany(), saved.getRole(), oldStatus, saved.getStatus());
        }

        return mapToResponse(saved);
    }

    public void deleteApplication(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Application not found with id: " + id);
        }
        repository.deleteById(id);
    }

    public List<JobApplicationResponse> getByStatus(String status) {
        User currentUser = getCurrentUser();
        return repository.findByUserIdAndStatus(currentUser.getId(), status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<JobApplicationResponse> searchByCompany(String company) {
        User currentUser = getCurrentUser();
        return repository.findByUserIdAndCompanyContainingIgnoreCase(currentUser.getId(), company)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private JobApplicationResponse mapToResponse(JobApplication app) {
        List<Resume> docs = resumeRepository.findByApplicationId(app.getId());
        List<JobApplicationResponse.ResumeInfo> docInfos = docs.stream()
                .map(d -> JobApplicationResponse.ResumeInfo.builder()
                        .id(d.getId())
                        .fileName(d.getFileName())
                        .fileType(d.getFileType())
                        .uploadedAt(d.getUploadedAt().format(FORMATTER))
                        .build())
                .collect(Collectors.toList());

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
                .documents(docInfos)
                .build();
    }
}