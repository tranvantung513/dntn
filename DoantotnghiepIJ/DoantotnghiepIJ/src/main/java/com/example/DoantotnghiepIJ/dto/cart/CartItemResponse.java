package com.example.DoantotnghiepIJ.dto.cart;


import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class CartItemResponse {
    private UUID productId;
    private String name;        // 🔥 THÊM
    private String thumbnail;
    private BigDecimal price;
    private int quantity;
    private BigDecimal total;
}