package com.aarthi.jobtracker.controller;

import com.aarthi.jobtracker.entity.JobApplication;
import com.aarthi.jobtracker.entity.Resume;
import com.aarthi.jobtracker.repository.JobApplicationRepository;
import com.aarthi.jobtracker.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final JobApplicationRepository jobApplicationRepository;

    private final Path uploadDir = Paths.get("uploads/resumes");

    @PostMapping("/upload/{applicationId}")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long applicationId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileType") String fileType) {
        try {
            JobApplication app = jobApplicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            Files.createDirectories(uploadDir);

            String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadDir.resolve(uniqueName);
            Files.copy(file.getInputStream(), filePath);

            Resume resume = new Resume();
            resume.setFileName(file.getOriginalFilename());
            resume.setFilePath(filePath.toString());
            resume.setFileType(fileType);
            resume.setApplication(app);

            Resume saved = resumeRepository.save(resume);

            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "fileName", saved.getFileName(),
                    "fileType", saved.getFileType(),
                    "message", "File uploaded successfully"
            ));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        try {
            Resume resume = resumeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            Path filePath = Paths.get(resume.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resume.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            Resume resume = resumeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            Files.deleteIfExists(Paths.get(resume.getFilePath()));
            resumeRepository.delete(resume);

            return ResponseEntity.ok(Map.of("message", "Document deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}