package com.aarthi.jobtracker.repository;

import com.aarthi.jobtracker.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByStatus(String status);

    List<JobApplication> findByCompanyContainingIgnoreCase(String company);

    List<JobApplication> findAllByOrderByUpdatedAtDesc();
}