package com.example.DoantotnghiepIJ.mapper;

import com.example.DoantotnghiepIJ.dto.Salary.SalaryConfigResponse;
import com.example.DoantotnghiepIJ.entity.SalaryConfig;
import org.springframework.stereotype.Component;

@Component
public class SalaryConfigMapper {

    public SalaryConfigResponse toResponse(SalaryConfig entity, String userName) {
        return SalaryConfigResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .userName(userName)
                .position(entity.getPosition())
                .salaryPerHour(entity.getSalaryPerHour())
                .build();
    }
}