package com.aarthi.jobtracker.service;

import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final AIService aiService;

    public String extractText(MultipartFile file) throws Exception {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public String analyzeResume(MultipartFile file, String targetRole) throws Exception {
        String resumeText = extractText(file);
        return aiService.getResumeFeedback(resumeText, targetRole);
    }

    public String generateCoverLetter(MultipartFile file, String company, String role) throws Exception {
        String resumeText = extractText(file);
        return aiService.generateCoverLetter(company, role, resumeText);
    }
}