package com.example.DoantotnghiepIJ.dto.SalaryRecord;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SalaryRecordResponse {

    private Long userId;
    private String name;

    private double totalHours;
    private double salaryPerHour;

    private double baseSalary;
    private double allowance;
    private double deduction;

    private double finalSalary;
    private Boolean isLocked;
}