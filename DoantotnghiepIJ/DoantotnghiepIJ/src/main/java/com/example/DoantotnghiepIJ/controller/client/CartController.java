package com.example.DoantotnghiepIJ.controller.client;

import com.example.DoantotnghiepIJ.dto.cart.AddToCartRequest;
import com.example.DoantotnghiepIJ.dto.cart.CartResponse;
import com.example.DoantotnghiepIJ.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // =========================
    // 🔧 HANDLE SESSION
    // =========================
    private String resolveSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return UUID.randomUUID().toString();
        }
        return sessionId;
    }

    // =========================
    // 🛒 GET CART
    // =========================
    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String finalSessionId = resolveSessionId(sessionId);

        CartResponse response = cartService.getCart(finalSessionId);

        return ResponseEntity.ok()
                .header("X-Session-Id", finalSessionId) //  trả lại cho FE
                .body(response);
    }

    // =========================
    // ➕ ADD TO CART
    // =========================
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @RequestBody AddToCartRequest request,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String finalSessionId = resolveSessionId(sessionId);

        CartResponse response = cartService.addToCart(
                request.getProductId(),
                request.getQuantity(),
                finalSessionId
        );

        return ResponseEntity.ok()
                .header("X-Session-Id", finalSessionId)
                .body(response);
    }

    // =========================
    // 🔄 UPDATE QUANTITY
    // =========================
    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateQuantity(
            @PathVariable UUID productId,
            @RequestParam int quantity,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String finalSessionId = resolveSessionId(sessionId);

        CartResponse response = cartService.updateQuantity(productId, quantity, finalSessionId);

        return ResponseEntity.ok()
                .header("X-Session-Id", finalSessionId)
                .body(response);
    }

    // =========================
    // ❌ REMOVE ITEM
    // =========================
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(
            @PathVariable UUID productId,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String finalSessionId = resolveSessionId(sessionId);

        CartResponse response = cartService.removeItem(productId, finalSessionId);

        return ResponseEntity.ok()
                .header("X-Session-Id", finalSessionId)
                .body(response);
    }

    // =========================
    // 🧹 CLEAR CART
    // =========================
    @DeleteMapping
    public ResponseEntity<String> clearCart(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId
    ) {
        String finalSessionId = resolveSessionId(sessionId);

        cartService.clearCart(finalSessionId);

        return ResponseEntity.ok()
                .header("X-Session-Id", finalSessionId)
                .body("Cart cleared successfully");
    }
}