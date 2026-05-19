package com.example.DoantotnghiepIJ.service;



import com.example.DoantotnghiepIJ.dto.Discount.DiscountRequest;
import com.example.DoantotnghiepIJ.entity.Discount;
import com.example.DoantotnghiepIJ.mapper.DiscountMapper;
import com.example.DoantotnghiepIJ.repository.DiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;

    public Discount create(DiscountRequest request) {
        Discount discount = DiscountMapper.toEntity(request);
        if (discount.getIsDeleted() == null) {
            discount.setIsDeleted(false);
        }

        if (discount.getStatus() == null) {
            discount.setStatus(true);
        }
        return discountRepository.save(discount);
    }

    public Discount update(Long id, DiscountRequest request) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found"));

        DiscountMapper.update(discount, request);

        // 🔥 FIX 1: LẤY TRỰC TIẾP TRẠNG THÁI TỪ FRONTEND TRUYỀN XUỐNG (Quan trọng nhất)
        if (request.getStatus() != null) {
            discount.setStatus(request.getStatus());
        }

        // FIX status null (Trường hợp dữ liệu hỏng)
        if (discount.getStatus() == null) {
            discount.setStatus(true);
        }

        // 🔥 Logic business: auto tắt nếu hết hạn (Backend tự soi vòng lặp thời gian)
        LocalDateTime now = LocalDateTime.now();
        if (discount.getEndDate() != null && now.isAfter(discount.getEndDate())) {
            discount.setStatus(false);
        }

        return discountRepository.save(discount);
    }

    public void delete(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Discount not found"));

        discount.setIsDeleted(true);
        discountRepository.save(discount);
    }

    public Discount getByCode(String code) {
        return discountRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new RuntimeException("Discount not found"));
    }
    public Page<Discount> getAllFull(int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return discountRepository.findAll(pageable); // 🔥 lấy tất cả
    }

    public java.util.List<Discount> getActiveDiscounts() {
        return discountRepository.findByStatusTrueAndIsDeletedFalse();
    }
    // 🔥 APPLY DISCOUNT
    public BigDecimal applyDiscount(String code, BigDecimal orderTotal) {
        Discount discount = getByCode(code);

        if (!discount.getStatus()) throw new RuntimeException("Discount inactive");

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(discount.getStartDate()) || now.isAfter(discount.getEndDate())) {
            throw new RuntimeException("Discount expired");
        }

        if (discount.getMinOrderValue() != null &&
                orderTotal.compareTo(discount.getMinOrderValue()) < 0) {
            throw new RuntimeException("Not enough order value");
        }

        BigDecimal discountAmount;

        if (discount.getDiscountType() == 0) {
            // %
            discountAmount = orderTotal
                    .multiply(discount.getDiscountValue())
                    .divide(BigDecimal.valueOf(100));

            if (discount.getMaxDiscount() != null &&
                    discountAmount.compareTo(discount.getMaxDiscount()) > 0) {
                discountAmount = discount.getMaxDiscount();
            }
        } else {
            // tiền
            discountAmount = discount.getDiscountValue();
        }

        return orderTotal.subtract(discountAmount);
    }
}