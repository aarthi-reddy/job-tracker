package com.aarthi.jobtracker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendNewApplicationEmail(String toEmail, String company, String role) {
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
    public void sendStatusUpdateEmail(String toEmail, String company, String role, String oldStatus, String newStatus) {
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

    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "JobTracker - Verify Your Email";
        String body = "<div style='font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px'>"
                + "<h2 style='color:#0f172a;text-align:center'>Verify Your Email</h2>"
                + "<p style='color:#475569;text-align:center'>Enter this code to complete your registration</p>"
                + "<div style='background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin:24px 0'>"
                + "<span style='font-size:36px;font-weight:700;letter-spacing:8px;color:#0f172a'>" + otp + "</span>"
                + "</div>"
                + "<p style='color:#94a3b8;text-align:center;font-size:13px'>This code expires in 10 minutes</p>"
                + "<p style='color:#94a3b8;text-align:center;font-size:13px'>If you didn't create an account, ignore this email</p>"
                + "</div>";
        sendEmail(toEmail, subject, body);
    }
}