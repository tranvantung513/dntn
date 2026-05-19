package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.Menu.ProductResponse;
import com.example.DoantotnghiepIJ.dto.cart.CartItemResponse;
import com.example.DoantotnghiepIJ.dto.cart.CartResponse;
import com.example.DoantotnghiepIJ.entity.Cart.Cart;
import com.example.DoantotnghiepIJ.entity.Cart.CartItem;
import com.example.DoantotnghiepIJ.entity.CustomUserPrincipal;
import com.example.DoantotnghiepIJ.entity.User;
import com.example.DoantotnghiepIJ.repository.CartItemRepository;
import com.example.DoantotnghiepIJ.repository.CartRepository;
import com.example.DoantotnghiepIJ.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductClient productClient;

    // =========================
    // 🔥 CORE: lấy cart (user / guest)
    // =========================
    private Cart getCurrentCart(String sessionId) {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        // 👉 CASE 1: USER (đã login)
        if (auth != null
                && auth.isAuthenticated()
                && !(auth instanceof AnonymousAuthenticationToken)) {

            CustomUserPrincipal principal = (CustomUserPrincipal) auth.getPrincipal();

            Long userId = principal.getUserId();

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return cartRepository.findByUserId(user.getId())
                    .orElseGet(() -> cartRepository.save(
                            Cart.builder()
                                    .user(user)
                                    .build()
                    ));
        }

        // 👉 CASE 2: GUEST (BẮT BUỘC phải có sessionId)
        if (sessionId == null || sessionId.isBlank()) {
            throw new RuntimeException("SessionId is required");
        }

        return cartRepository.findBySessionId(sessionId)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .sessionId(sessionId)
                                .build()
                ));
    }

    // =========================
    // 🛒 GET CART
    // =========================
    public CartResponse getCart(String sessionId) {
        Cart cart = getCurrentCart(sessionId);
        return buildCartResponse(cart);
    }

    // =========================
    // 🔧 BUILD RESPONSE (dùng chung cho user lẫn guest)
    // =========================
    private CartResponse buildCartResponse(Cart cart) {

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            return CartResponse.builder()
                    .items(List.of())
                    .subtotal(BigDecimal.ZERO)
                    .total(BigDecimal.ZERO)
                    .build();
        }

        List<UUID> productIds = cart.getItems().stream()
                .map(CartItem::getProductId)
                .toList();

        List<ProductResponse> products = productClient.getProducts(productIds);

        Map<UUID, ProductResponse> productMap = products.stream()
                .collect(Collectors.toMap(ProductResponse::getId, p -> p));

        List<CartItemResponse> items = cart.getItems().stream()
                .map(item -> {
                    ProductResponse p = productMap.get(item.getProductId());
                    if (p == null) return null;
                    return CartItemResponse.builder()
                            .productId(item.getProductId())
                            .name(p.getName())
                            .thumbnail(p.getThumbnail())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .total(item.getTotal())
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(items)
                .subtotal(subtotal)
                .total(subtotal)
                .build();
    }

    // =========================
    // ➕ ADD TO CART
    // =========================
    public CartResponse addToCart(UUID productId, int quantity, String sessionId) {

        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be > 0");
        }

        Cart cart = getCurrentCart(sessionId);

        List<ProductResponse> products = productClient.getProducts(List.of(productId));

        if (products.isEmpty()) {
            throw new RuntimeException("Product not found: " + productId);
        }

        ProductResponse product = products.get(0);

        Double finalPrice = product.getDiscountPrice() != null
                ? product.getDiscountPrice()
                : product.getPrice();

        BigDecimal price = BigDecimal.valueOf(finalPrice)
                .setScale(2, RoundingMode.HALF_UP);

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElse(null);

        if (item != null) {
            item.setQuantity(item.getQuantity() + quantity);
        } else {
            item = CartItem.builder()
                    .productId(productId)
                    .quantity(quantity)
                    .price(price)
                    .build();

            cart.addItem(item); // 🔥 cascade sẽ tự save
        }

        cartRepository.save(cart);

        return buildCartResponse(cart);
    }

    // =========================
    // 🔄 UPDATE QUANTITY
    // =========================
    public CartResponse updateQuantity(UUID productId, int quantity, String sessionId) {

        Cart cart = getCurrentCart(sessionId);

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (quantity > 100) {
            throw new RuntimeException("Quantity too large");
        }

        if (quantity <= 0) {
            cart.removeItem(item);
        } else {
            item.setQuantity(quantity);
        }

        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // =========================
    // ❌ REMOVE ITEM
    // =========================
    public CartResponse removeItem(UUID productId, String sessionId) {

        Cart cart = getCurrentCart(sessionId);

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        cart.removeItem(item);
        cartRepository.save(cart);

        return buildCartResponse(cart);
    }

    // =========================
    // 🧹 CLEAR CART
    // =========================
    public void clearCart(String sessionId) {

        Cart cart = getCurrentCart(sessionId);

        cart.getItems().clear();
        cartRepository.save(cart);
    }
}