package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {


    List<Order> findByUserId(String userId);
    @Query("SELECT o FROM Order o WHERE o.paymentStatus = 'PENDING'")
    List<Order> findPendingOrders();
}