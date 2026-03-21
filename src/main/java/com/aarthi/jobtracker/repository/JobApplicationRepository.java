package com.aarthi.jobtracker.repository;

import com.aarthi.jobtracker.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByStatus(String status);
    List<JobApplication> findByCompanyContainingIgnoreCase(String company);
    List<JobApplication> findAllByOrderByUpdatedAtDesc();
    List<JobApplication> findByUserIdOrderByUpdatedAtDesc(Long userId);
    List<JobApplication> findByUserIdAndStatus(Long userId, String status);
    List<JobApplication> findByUserIdAndCompanyContainingIgnoreCase(Long userId, String company);

    long countByUserId(Long userId);

    @Query("SELECT j.status, COUNT(j) FROM JobApplication j GROUP BY j.status")
    List<Object[]> countByStatusGrouped();
}