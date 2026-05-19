package com.example.DoantotnghiepIJ.service;



import com.example.DoantotnghiepIJ.dto.Booking.BookingRequest;
import com.example.DoantotnghiepIJ.dto.Booking.BookingResponse;
import com.example.DoantotnghiepIJ.entity.Booking;
import com.example.DoantotnghiepIJ.Enum.BookingStatus;
import com.example.DoantotnghiepIJ.repository.BookingRepository;
import com.example.DoantotnghiepIJ.validate.UtilsValidate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository repository;

    // 🟢 Create booking
    public BookingResponse create(BookingRequest request) {
        UtilsValidate.validatePhone(request.getPhone());
        Booking booking = Booking.builder()
                .customerName(request.getName())
                .phone(request.getPhone())
                .people(request.getPeople())
                .bookingTime(request.getBookingTime())
                .note(request.getNote())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(booking);
        return mapToResponse(booking);
    }

    // 🟡 Get all
    public List<BookingResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 🟡 Get by status
    public List<BookingResponse> getByStatus(BookingStatus status) {
        return repository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 🟢 Confirm booking
    public void confirm(UUID id) {
        Booking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Invalid state");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());

        repository.save(booking);
    }

    // 🔴 Cancel booking
    public void cancel(UUID id) {
        Booking booking = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());

        repository.save(booking);
    }

    // 🔄 Mapper
    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .customerName(booking.getCustomerName())
                .phone(booking.getPhone())
                .people(booking.getPeople())
                .bookingTime(booking.getBookingTime())
                .note(booking.getNote())
                .status(booking.getStatus())
                .build();
    }
}