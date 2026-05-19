package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.dto.Salary.SalaryConfigRequest;
import com.example.DoantotnghiepIJ.dto.Salary.SalaryConfigResponse;
import com.example.DoantotnghiepIJ.service.SalaryConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary-config")
@RequiredArgsConstructor
public class SalaryConfigController {

    private final SalaryConfigService salaryConfigService;

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasAuthority('SALARY_CONFIG_CREATE')")
    public SalaryConfigResponse create(
            @RequestBody SalaryConfigRequest request
    ) {
        return salaryConfigService.create(request);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SALARY_CONFIG_UPDATE')")
    public SalaryConfigResponse update(
            @PathVariable Long id,
            @RequestBody SalaryConfigRequest request
    ) {
        return salaryConfigService.update(id, request);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SALARY_CONFIG_DELETE')")
    public void delete(@PathVariable Long id) {
        salaryConfigService.delete(id);
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SALARY_CONFIG_VIEW')")
    public SalaryConfigResponse getById(
            @PathVariable Long id
    ) {
        return salaryConfigService.getById(id);
    }

    // ================= GET ALL =================
    @GetMapping
    @PreAuthorize("hasAuthority('SALARY_CONFIG_VIEW')")
    public List<SalaryConfigResponse> getAll() {
        return salaryConfigService.getAll();
    }
}