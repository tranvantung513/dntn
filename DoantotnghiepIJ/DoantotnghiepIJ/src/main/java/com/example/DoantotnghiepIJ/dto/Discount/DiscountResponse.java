package com.example.DoantotnghiepIJ.dto.Discount;



import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DiscountResponse {

    private String code;
    private String name;
    private Integer discountType;
    private BigDecimal discountValue;
}