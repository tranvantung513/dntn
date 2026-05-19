package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.SalaryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SalaryConfigRepository extends JpaRepository<SalaryConfig, Long> {

    Optional<SalaryConfig> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
    @Query("""
    SELECT s.salaryPerHour
    FROM SalaryConfig s
    WHERE s.userId = :userId
""")
    Double getSalaryByUserId(Long userId);
}