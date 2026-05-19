package com.example.DoantotnghiepIJ.dto.cart;



import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddToCartRequest {
    private UUID productId;
    private int quantity;
}