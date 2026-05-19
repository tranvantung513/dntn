package com.example.DoantotnghiepIJ.dto.Booking;

import com.example.DoantotnghiepIJ.Enum.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BookingResponse {
    private UUID id;
    private String customerName;
    private String phone;
    private Integer people;
    private LocalDateTime bookingTime;
    private String note;
    private BookingStatus status;
}