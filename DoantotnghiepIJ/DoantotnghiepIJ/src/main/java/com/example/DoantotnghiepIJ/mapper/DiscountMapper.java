package com.example.DoantotnghiepIJ.mapper;



import com.example.DoantotnghiepIJ.dto.Discount.DiscountRequest;
import com.example.DoantotnghiepIJ.entity.Discount;

public class DiscountMapper {

    public static Discount toEntity(DiscountRequest request) {
        return Discount.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscount(request.getMaxDiscount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
    }

    public static void update(Discount discount, DiscountRequest request) {
        discount.setName(request.getName());
        discount.setDescription(request.getDescription());
        discount.setDiscountType(request.getDiscountType());
        discount.setDiscountValue(request.getDiscountValue());
        discount.setMinOrderValue(request.getMinOrderValue());
        discount.setMaxDiscount(request.getMaxDiscount());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
    }
}