package com.example.DoantotnghiepIJ.dto.Attendance;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateAttendanceRequest {
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
}