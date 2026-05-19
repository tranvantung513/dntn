package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, UUID> {

    List<RestaurantTable> findByIsDeletedFalse();

    boolean existsByCode(String code);
}