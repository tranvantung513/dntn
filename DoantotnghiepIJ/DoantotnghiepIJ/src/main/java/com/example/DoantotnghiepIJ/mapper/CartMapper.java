package com.example.DoantotnghiepIJ.mapper;



import com.example.DoantotnghiepIJ.dto.cart.CartItemResponse;
import com.example.DoantotnghiepIJ.entity.Cart.CartItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CartMapper {

    default CartItemResponse toItemResponse(CartItem item) {
        return CartItemResponse.builder()
                .productId(item.getProductId())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .total(item.getTotal())
                .build();
    }
}