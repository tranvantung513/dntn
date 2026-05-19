package com.example.DoantotnghiepIJ.repository;



import com.example.DoantotnghiepIJ.entity.Cart.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, UUID productId);
}