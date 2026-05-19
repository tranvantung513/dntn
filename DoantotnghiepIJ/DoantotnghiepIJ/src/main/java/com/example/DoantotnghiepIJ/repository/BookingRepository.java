package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.Booking;
import com.example.DoantotnghiepIJ.Enum.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByStatus(BookingStatus status);
}