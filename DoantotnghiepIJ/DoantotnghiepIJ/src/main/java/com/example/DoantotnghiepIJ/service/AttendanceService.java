package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.Attendance.CreateAttendanceRequest;
import com.example.DoantotnghiepIJ.dto.Attendance.UpdateAttendanceRequest;
import com.example.DoantotnghiepIJ.entity.Attendance;
import com.example.DoantotnghiepIJ.Enum.AttendanceStatus;
import com.example.DoantotnghiepIJ.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    // =========================
    //  NHÂN VIÊN
    // =========================

    //  Check-in
    public Attendance checkIn(Long userId) {
        LocalDate today = LocalDate.now();

        boolean hasOpenShift = attendanceRepository
                .existsByUserIdAndDateAndCheckOutIsNull(userId, today);

        if (hasOpenShift) {
            throw new IllegalStateException("Bạn chưa check-out ca trước!");
        }

        Attendance attendance = Attendance.builder()
                .userId(userId)
                .checkIn(LocalDateTime.now())
                .date(today)
                .status(AttendanceStatus.PENDING) // 🔥 sửa
                .build();

        return attendanceRepository.save(attendance);
    }

    //  Check-out
    public Attendance checkOut(Long userId) {
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository
                .findTopByUserIdAndDateAndCheckOutIsNullOrderByCheckInDesc(userId, today)
                .orElseThrow(() -> new RuntimeException("Chưa check-in!"));

        LocalDateTime now = LocalDateTime.now();
        attendance.setCheckOut(now);

        double hours = Duration.between(attendance.getCheckIn(), now)
                .toMinutes() / 60.0;

        attendance.setWorkingHours(hours);

        attendance.setStatus(AttendanceStatus.PENDING); // 🔥 đảm bảo luôn PENDING

        return attendanceRepository.save(attendance);
    }

    //  Lịch sử theo tháng (nhân viên)
    public List<Attendance> getHistory(Long userId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        return attendanceRepository.findByUserIdAndDateBetween(userId, start, end);
    }

    //  Tổng giờ (CHỈ tính APPROVED)
    public double getTotalHours(Long userId, int month, int year) {
        return getHistory(userId, month, year)
                .stream()
                .filter(a -> a.getStatus() == AttendanceStatus.APPROVED)
                .mapToDouble(a -> a.getWorkingHours() != null ? a.getWorkingHours() : 0)
                .sum();
    }

    // =========================
    //  ADMIN
    // =========================

    // Lấy danh sách theo ngày
    public List<Attendance> getAllByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    // ✅ Phân trang + filter theo ngày
    public Page<Attendance> getAllByDatePaging(LocalDate date, int page, int size) {
        return attendanceRepository.findByDate(date, PageRequest.of(page, size));
    }

    // ✅ Lấy tất cả (optional)
    public Page<Attendance> getAll(int page, int size) {
        return attendanceRepository.findAll(PageRequest.of(page, size));
    }

    // ✅ Admin - Lấy toàn bộ bản ghi trong tháng/năm
    public List<Attendance> getByMonth(int month, int year) {
        return attendanceRepository.findByMonthAndYear(month, year);
    }

    // ✅ Admin - Lấy bản ghi của 1 nhân viên trong tháng/năm
    public List<Attendance> getByUserAndMonth(Long userId, int month, int year) {
        return attendanceRepository.findByUserIdAndMonthAndYear(userId, month, year);
    }

    // =========================
    // 🔥 ADMIN DUYỆT
    // =========================

//    public Attendance approve(Long attendanceId, Long adminId) {
//        Attendance att = attendanceRepository.findById(attendanceId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy"));
//
//        att.setStatus(AttendanceStatus.APPROVED);
//        att.setApprovedBy(adminId);
//        att.setApprovedAt(LocalDateTime.now());
//
//        return attendanceRepository.save(att);
//    }
//
//    public Attendance reject(Long attendanceId, Long adminId) {
//        Attendance att = attendanceRepository.findById(attendanceId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy"));
//
//        att.setStatus(AttendanceStatus.REJECTED);
//        att.setApprovedBy(adminId);
//        att.setApprovedAt(LocalDateTime.now());
//
//        return attendanceRepository.save(att);
//    }
public Attendance updateStatus(Long id, AttendanceStatus status) {
    Attendance att = attendanceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy"));

    att.setStatus(status);
    att.setApprovedAt(LocalDateTime.now());

    return attendanceRepository.save(att);
}
    public Attendance updateTime(Long id, UpdateAttendanceRequest request) {
        Attendance att = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy"));

        // cập nhật nếu có
        if (request.getCheckIn() != null) {
            att.setCheckIn(request.getCheckIn());
        }

        if (request.getCheckOut() != null) {
            att.setCheckOut(request.getCheckOut());
        }

        // validate + tính lại giờ nếu đủ dữ liệu
        if (att.getCheckIn() != null && att.getCheckOut() != null) {

            if (att.getCheckOut().isBefore(att.getCheckIn())) {
                throw new RuntimeException("Giờ ra phải sau giờ vào");
            }

            double hours = Duration.between(
                    att.getCheckIn(),
                    att.getCheckOut()
            ).toMinutes() / 60.0;

            att.setWorkingHours(hours);
        }

        // reset trạng thái
        att.setStatus(AttendanceStatus.PENDING);

        return attendanceRepository.save(att);
    }

    public Attendance createByAdmin(CreateAttendanceRequest request) {

        Attendance att = new Attendance();

        att.setUserId(request.getUserId());
        att.setDate(request.getDate());
        att.setCheckIn(request.getCheckIn());
        att.setCheckOut(request.getCheckOut());

        // tính giờ nếu có đủ
        if (request.getCheckIn() != null && request.getCheckOut() != null) {

            if (request.getCheckOut().isBefore(request.getCheckIn())) {
                throw new RuntimeException("Giờ ra phải sau giờ vào");
            }

            double hours = Duration.between(
                    request.getCheckIn(),
                    request.getCheckOut()
            ).toMinutes() / 60.0;

            att.setWorkingHours(hours);
        }

        // 🔥 admin tạo → nên để PENDING hoặc APPROVED tùy bạn
        att.setStatus(AttendanceStatus.PENDING);

        return attendanceRepository.save(att);
    }
}