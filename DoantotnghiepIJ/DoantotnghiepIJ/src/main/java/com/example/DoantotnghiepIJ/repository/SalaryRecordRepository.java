package com.example.DoantotnghiepIJ.repository;


import com.example.DoantotnghiepIJ.entity.SalaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalaryRecordRepository extends JpaRepository<SalaryRecord, Long> {

    Optional<SalaryRecord> findByUserIdAndMonthAndYear(Long userId, int month, int year);

    void deleteByUserIdAndMonthAndYear(Long userId, int month, int year);
}