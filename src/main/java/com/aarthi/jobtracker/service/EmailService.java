package com.aarthi.jobtracker.service;

import com.aarthi.jobtracker.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private String getCurrentUserEmail() {
        try {
            User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return user.getEmail();
        } catch (Exception e) {
            return null;
        }
    }

    @Async
    public void sendNewApplicationEmail(String company, String role) {
        String toEmail = getCurrentUserEmail();
        if (toEmail == null) return;

        String subject = "New Application Added: " + company + " - " + role;
        String body = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>"
                + "<h2 style='color:#3b82f6'>New Job Application Added</h2>"
                + "<div style='background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #e2e8f0'>"
                + "<p><strong>Company:</strong> " + company + "</p>"
                + "<p><strong>Role:</strong> " + role + "</p>"
                + "<p><strong>Status:</strong> APPLIED</p>"
                + "</div>"
                + "<p style='color:#64748b;margin-top:16px'>Sent from your JobTracker app</p>"
                + "</div>";
        sendEmail(toEmail, subject, body);
    }

    @Async
    public void sendStatusUpdateEmail(String company, String role, String oldStatus, String newStatus) {
        String toEmail = getCurrentUserEmail();
        if (toEmail == null) return;

        String subject = "Status Update: " + company + " - " + role + " → " + newStatus;
        String body = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>"
                + "<h2 style='color:#3b82f6'>Application Status Updated</h2>"
                + "<div style='background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #e2e8f0'>"
                + "<p><strong>Company:</strong> " + company + "</p>"
                + "<p><strong>Role:</strong> " + role + "</p>"
                + "<p><strong>Previous Status:</strong> " + oldStatus + "</p>"
                + "<p><strong>New Status:</strong> <span style='color:#22c55e;font-weight:bold'>" + newStatus + "</span></p>"
                + "</div>"
                + "<p style='color:#64748b;margin-top:16px'>Sent from your JobTracker app</p>"
                + "</div>";
        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}