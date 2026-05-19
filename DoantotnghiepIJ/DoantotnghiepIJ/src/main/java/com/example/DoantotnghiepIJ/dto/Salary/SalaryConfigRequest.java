package com.example.DoantotnghiepIJ.dto.Salary;

import lombok.Data;

import com.example.DoantotnghiepIJ.Enum.Position;

@Data
public class SalaryConfigRequest {
    private Long userId;
    private Position position;
    private Double salaryPerHour;
}