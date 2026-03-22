package com.aarthi.jobtracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    private LocalDateTime createdAt;

    private boolean verified;
    private String otp;
    private LocalDateTime otpExpiry;


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}