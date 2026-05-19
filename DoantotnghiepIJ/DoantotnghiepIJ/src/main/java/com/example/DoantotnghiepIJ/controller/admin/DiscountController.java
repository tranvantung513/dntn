package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.dto.Discount.DiscountRequest;
import com.example.DoantotnghiepIJ.entity.Discount;
import com.example.DoantotnghiepIJ.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/admin/discounts")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    // ================= GET ALL =================
    @GetMapping
    public Page<Discount> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return discountService.getAllFull(
                page,
                size,
                sortBy,
                sortDir
        );
    }

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasAuthority('DISCOUNT_CREATE')")
    public Discount create(
            @RequestBody DiscountRequest request
    ) {
        return discountService.create(request);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DISCOUNT_UPDATE')")
    public Discount update(
            @PathVariable Long id,
            @RequestBody DiscountRequest request
    ) {
        return discountService.update(id, request);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DISCOUNT_DELETE')")
    public void delete(@PathVariable Long id) {
        discountService.delete(id);
    }

    // ================= GET BY CODE =================
    @GetMapping("/{code}")
    public Discount getByCode(
            @PathVariable String code
    ) {
        return discountService.getByCode(code);
    }

    // ================= APPLY DISCOUNT =================
    @GetMapping("/apply")
    public BigDecimal apply(
            @RequestParam String code,
            @RequestParam BigDecimal total
    ) {
        return discountService.applyDiscount(code, total);
    }
}