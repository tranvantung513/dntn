package com.example.DoantotnghiepIJ.controller.client;

import com.example.DoantotnghiepIJ.Enum.AttendanceStatus;
import com.example.DoantotnghiepIJ.dto.Attendance.CreateAttendanceRequest;
import com.example.DoantotnghiepIJ.dto.Attendance.UpdateAttendanceRequest;
import com.example.DoantotnghiepIJ.entity.Attendance;
import com.example.DoantotnghiepIJ.entity.CustomUserPrincipal;
import com.example.DoantotnghiepIJ.service.AttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendances")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // Helper: lay userId tu JWT (SecurityContext)
    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserPrincipal principal) {
            return principal.getUserId();
        }
        // Fallback: thu lay tu request attribute (neu filter co set)
        return null;
    }

    //  Check-in
    @PostMapping("/check-in")
    public Attendance checkIn(HttpServletRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) userId = (Long) request.getAttribute("userId");
        return attendanceService.checkIn(userId);
    }

    //  Check-out
    @PostMapping("/check-out")
    public Attendance checkOut(HttpServletRequest request) {
        Long userId = getCurrentUserId();
        if (userId == null) userId = (Long) request.getAttribute("userId");
        return attendanceService.checkOut(userId);
    }

    //  Lich su
    @GetMapping("/history")
    public List<Attendance> getHistory(
            HttpServletRequest request,
            @RequestParam int month,
            @RequestParam int year
    ) {
        Long userId = getCurrentUserId();
        if (userId == null) userId = (Long) request.getAttribute("userId");
        return attendanceService.getHistory(userId, month, year);
    }

    //  Tong gio
    @GetMapping("/total-hours")
    public double getTotalHours(
            HttpServletRequest request,
            @RequestParam int month,
            @RequestParam int year
    ) {
        Long userId = getCurrentUserId();
        if (userId == null) userId = (Long) request.getAttribute("userId");
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

    // Admin - Lấy toàn bộ bản ghi trong tháng/năm
    @GetMapping("/admin/monthly")
    public ResponseEntity<?> getByMonth(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(attendanceService.getByMonth(month, year));
    }

    // Admin - Lấy bản ghi của 1 nhân viên trong tháng/năm
    @GetMapping("/admin/user-monthly")
    public ResponseEntity<?> getByUserAndMonth(
            @RequestParam Long userId,
            @RequestParam int month,
            @RequestParam int year
    ) {
        return ResponseEntity.ok(attendanceService.getByUserAndMonth(userId, month, year));
    }
}