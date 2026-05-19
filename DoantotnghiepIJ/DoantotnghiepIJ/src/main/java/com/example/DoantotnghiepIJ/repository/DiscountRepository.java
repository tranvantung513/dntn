package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.Discount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiscountRepository extends JpaRepository<Discount, Long> {

    Optional<Discount> findByCodeAndIsDeletedFalse(String code);
    Page<Discount> findByIsDeletedFalse(Pageable pageable);
    java.util.List<Discount> findByStatusTrueAndIsDeletedFalse();
}