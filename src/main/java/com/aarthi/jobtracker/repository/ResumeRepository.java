package com.aarthi.jobtracker.repository;

import com.aarthi.jobtracker.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByApplicationId(Long applicationId);
}