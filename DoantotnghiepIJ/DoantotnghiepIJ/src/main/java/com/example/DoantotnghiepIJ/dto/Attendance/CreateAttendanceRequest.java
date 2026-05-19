package com.example.DoantotnghiepIJ.dto.Attendance;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Getter
@Setter
public class CreateAttendanceRequest {
    private Long userId;
    private LocalDate date;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
}