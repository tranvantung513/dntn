package com.example.DoantotnghiepIJ.repository;



import com.example.DoantotnghiepIJ.entity.Cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findBySessionId(String sessionId);
    Optional<Cart> findByUserId(Long userId);
}