package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.Enum.AttendanceStatus;
import com.example.DoantotnghiepIJ.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // =========================
    // 👨‍💻 NHÂN VIÊN
    // =========================

    Optional<Attendance> findByUserIdAndDate(Long userId, LocalDate date);

    List<Attendance> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    boolean existsByUserIdAndDateAndCheckOutIsNull(Long userId, LocalDate date);

    Optional<Attendance> findTopByUserIdAndDateAndCheckOutIsNullOrderByCheckInDesc(
            Long userId, LocalDate date
    );

    // =========================
    // 👨‍💼 ADMIN
    // =========================

    // 🔥 thiếu cái này (service đang cần)
    List<Attendance> findByDate(LocalDate date);

    // phân trang
    Page<Attendance> findByDate(LocalDate date, Pageable pageable);

    // filter theo status (PENDING / APPROVED / REJECTED)
    List<Attendance> findByStatus(AttendanceStatus status);

    // 🔥 cực hữu ích cho dashboard
    long countByDate(LocalDate date);

    long countByDateAndStatus(LocalDate date, AttendanceStatus status);

    @Query("""
    SELECT COALESCE(SUM(a.workingHours), 0)
    FROM Attendance a
    WHERE a.userId = :userId
    AND a.status = 'APPROVED'
    AND a.checkOut IS NOT NULL
    AND MONTH(a.date) = :month
    AND YEAR(a.date) = :year
""")
    double sumWorkingHours(Long userId, int month, int year);

    // Tính tất cả giᤁ đã có checkOut (kể cả PENDING) - dùng cho hiển thị bảng lương
    @Query("""
    SELECT COALESCE(SUM(a.workingHours), 0)
    FROM Attendance a
    WHERE a.userId = :userId
    AND a.checkOut IS NOT NULL
    AND MONTH(a.date) = :month
    AND YEAR(a.date) = :year
""")
    double sumAllWorkingHours(Long userId, int month, int year);

    // Lấy toàn bộ bản ghi theo tháng/năm (dùng cho admin xem tổng theo nhân viên)
    @Query("""
    SELECT a FROM Attendance a
    WHERE MONTH(a.date) = :month
    AND YEAR(a.date) = :year
    ORDER BY a.date DESC
""")
    List<Attendance> findByMonthAndYear(int month, int year);

    // Lấy theo userId + tháng/năm (admin xem chi tiết 1 nhân viên)
    @Query("""
    SELECT a FROM Attendance a
    WHERE a.userId = :userId
    AND MONTH(a.date) = :month
    AND YEAR(a.date) = :year
    ORDER BY a.date DESC
""")
    List<Attendance> findByUserIdAndMonthAndYear(Long userId, int month, int year);

}