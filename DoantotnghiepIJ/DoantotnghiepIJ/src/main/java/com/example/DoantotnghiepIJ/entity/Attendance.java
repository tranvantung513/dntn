package com.example.DoantotnghiepIJ.entity;

import com.example.DoantotnghiepIJ.Enum.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendances")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDateTime checkIn;

    private LocalDateTime checkOut;

    private Double workingHours;

    private LocalDate date;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;
    private Long approvedBy;
    private LocalDateTime approvedAt;
}