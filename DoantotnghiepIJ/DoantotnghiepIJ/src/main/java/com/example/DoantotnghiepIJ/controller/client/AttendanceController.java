package com.example.DoantotnghiepIJ.controller.client;

import com.example.DoantotnghiepIJ.Enum.AttendanceStatus;
import com.example.DoantotnghiepIJ.dto.Attendance.CreateAttendanceRequest;
import com.example.DoantotnghiepIJ.dto.Attendance.UpdateAttendanceRequest;
import com.example.DoantotnghiepIJ.entity.Attendance;
import com.example.DoantotnghiepIJ.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    //  Check-in
    @PostMapping("/check-in")
    public Attendance checkIn(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return attendanceService.checkIn(userId);
    }

    //  Check-out
    @PostMapping("/check-out")
    public Attendance checkOut(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return attendanceService.checkOut(userId);
    }

    //  Lịch sử
    @GetMapping("/history")
    public List<Attendance> getHistory(
            HttpServletRequest request,
            @RequestParam int month,
            @RequestParam int year
    ) {
        Long userId = (Long) request.getAttribute("userId");
        return attendanceService.getHistory(userId, month, year);
    }

    //  Tổng giờ
    @GetMapping("/total-hours")
    public double getTotalHours(
            HttpServletRequest request,
            @RequestParam int month,
            @RequestParam int year
    ) {
        Long userId = (Long) request.getAttribute("userId");
        return attendanceService.getTotalHours(userId, month, year);
    }
    @GetMapping("/adminattandances")
    public List<Attendance> getAll(@RequestParam String date) {
        return attendanceService.getAllByDate(LocalDate.parse(date));
    }



//    @PutMapping("/{id}/approve")
//    public ResponseEntity<?> approve(
//            @PathVariable Long id,
//            @RequestParam Long adminId
//    ) {
//        return ResponseEntity.ok(
//                attendanceService.approve(id, adminId)
//        );
//    }
//
//    // ❌ REJECT
//    @PutMapping("/{id}/reject")
//    public ResponseEntity<?> reject(
//            @PathVariable Long id,
//            @RequestParam Long adminId
//    ) {
//        return ResponseEntity.ok(
//                attendanceService.reject(id, adminId)
//        );
//    }
@PatchMapping("/{id}/status")
public Attendance updateStatus(@PathVariable Long id,
                               @RequestParam AttendanceStatus status) {
    return attendanceService.updateStatus(id, status);
}
    @PutMapping("/{id}")
    public Attendance updateTime(
            @PathVariable Long id,
            @RequestBody UpdateAttendanceRequest request
    ) {
        return attendanceService.updateTime(id, request);
    }
    @PostMapping("/admin")
    public ResponseEntity<?> createByAdmin(
            @RequestBody CreateAttendanceRequest request
    ) {
        return ResponseEntity.ok(attendanceService.createByAdmin(request));
    }
}