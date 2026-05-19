package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.dto.SalaryRecord.*;
import com.example.DoantotnghiepIJ.service.SalaryRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/salaries")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryRecordService salaryService;

    // ================= GET SALARIES =================
    @GetMapping
    @PreAuthorize("hasAuthority('SALARY_VIEW')")
    public ResponseEntity<?> getSalaries(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                salaryService.getSalaries(
                        month,
                        year,
                        PageRequest.of(page, size)
                )
        );
    }

    // ================= UPDATE SALARY =================
    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('SALARY_UPDATE')")
    public ResponseEntity<?> updateSalary(
            @PathVariable Long userId,
            @RequestParam int month,
            @RequestParam int year,
            @RequestBody SalaryUpdateRequest request
    ) {
        salaryService.updateSalary(
                userId,
                month,
                year,
                request
        );

        return ResponseEntity.ok("Cập nhật thành công");
    }

    // ================= DELETE SALARY =================
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasAuthority('SALARY_DELETE')")
    public ResponseEntity<?> deleteSalary(
            @PathVariable Long userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        salaryService.deleteSalary(userId, month, year);

        return ResponseEntity.ok("Xóa thành công");
    }

    // ================= LOCK SALARY =================
    @PostMapping("/lock")
    @PreAuthorize("hasAuthority('SALARY_LOCK')")
    public ResponseEntity<?> lockSalary(
            @RequestParam int month,
            @RequestParam int year
    ) {
        salaryService.lockSalary(month, year);

        return ResponseEntity.ok("Đã chốt lương");
    }

    // ================= EXPORT EXCEL =================
    @GetMapping("/export")
    @PreAuthorize("hasAuthority('SALARY_EXPORT')")
    public ResponseEntity<InputStreamResource> exportExcel(
            @RequestParam int month,
            @RequestParam int year
    ) {

        ByteArrayInputStream stream =
                salaryService.exportExcel(month, year);

        HttpHeaders headers = new HttpHeaders();
        headers.add(
                "Content-Disposition",
                "attachment; filename=bang_luong.xlsx"
        );

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(stream));
    }
}