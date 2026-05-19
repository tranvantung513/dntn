package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.dto.Booking.BookingRequest;
import com.example.DoantotnghiepIJ.dto.Booking.BookingResponse;
import com.example.DoantotnghiepIJ.Enum.BookingStatus;
import com.example.DoantotnghiepIJ.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService service;

    // ================= USER CREATE BOOKING =================
    @PostMapping
    public BookingResponse create(@RequestBody BookingRequest request) {
        return service.create(request);
    }

    // ================= ADMIN GET ALL BOOKINGS =================
    @GetMapping
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public List<BookingResponse> getAll() {
        return service.getAll();
    }

    // ================= FILTER BY STATUS =================
    @GetMapping("/status")
    @PreAuthorize("hasAuthority('BOOKING_VIEW')")
    public List<BookingResponse> getByStatus(
            @RequestParam BookingStatus status
    ) {
        return service.getByStatus(status);
    }

    // ================= CONFIRM BOOKING =================
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('BOOKING_UPDATE')")
    public String confirm(@PathVariable UUID id) {
        service.confirm(id);
        return "Confirmed";
    }

    // ================= CANCEL BOOKING =================
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('BOOKING_UPDATE')")
    public String cancel(@PathVariable UUID id) {
        service.cancel(id);
        return "Cancelled";
    }
}