package com.example.DoantotnghiepIJ.dto.Salary;
import com.example.DoantotnghiepIJ.Enum.Position;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SalaryConfigResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Position position;
    private Double salaryPerHour;
}