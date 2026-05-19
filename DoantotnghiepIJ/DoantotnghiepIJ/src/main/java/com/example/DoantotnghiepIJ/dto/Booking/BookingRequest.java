package com.example.DoantotnghiepIJ.dto.Booking;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequest {
    private String name;
    private String phone;
    private Integer people;
    private LocalDateTime bookingTime;
    private String note;
}
