package com.example.DoantotnghiepIJ.controller;

import com.example.DoantotnghiepIJ.Enum.OrderStatus;
import com.example.DoantotnghiepIJ.Enum.PaymentStatus;
import com.example.DoantotnghiepIJ.entity.Order;
import com.example.DoantotnghiepIJ.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // =========================
    // TẠO ĐƠN
    // =========================
    // TẠO ĐƠN (khách hàng — không cần quyền admin)
    @PostMapping
    public Order createOrder(@RequestBody Order order) {

        if (order.getUserId() == null || order.getUserId().isEmpty()) {
            throw new RuntimeException("userId is required");
        }

        return orderService.createOrder(order);
    }

    // =========================
    // XEM DANH SÁCH
    // =========================
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    @GetMapping
    public List<Order> getAll() {
        return orderService.getAllOrders();
    }

    // =========================
    // XEM CHI TIẾT
    // =========================
    // XEM CHI TIẾT (khách hàng xem đơn của mình)
    @GetMapping("/{id}")
    public Order getDetail(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    // =========================
    // LẤY ĐƠN THEO USER
    // =========================
    // LẤY ĐƠN THEO USER (khách hàng xem lịch sử)
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(@PathVariable String userId) {
        return orderService.getOrdersByUser(userId);
    }

    // =========================
    // CẬP NHẬT ĐƠN
    // =========================
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    @PutMapping("/{id}")
    public Order updateOrder(@PathVariable Long id, @RequestBody Order order) {
        return orderService.updateOrder(id, order);
    }

    // =========================
    // CẬP NHẬT TRẠNG THÁI
    // =========================
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    @PatchMapping("/{id}/status")
    public Order updateStatus(@PathVariable Long id,
                              @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }

    // =========================
    // KHÁCH HÀNG HỦY ĐƠN
    // =========================
    @PatchMapping("/{id}/cancel")
    public Order cancelOrder(@PathVariable Long id) {
        return orderService.updateStatus(id, OrderStatus.CANCELLED);
    }

    // =========================
    // CẬP NHẬT THANH TOÁN
    // =========================
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    @PatchMapping("/{id}/payment")
    public Order updatePayment(@PathVariable Long id,
                               @RequestParam PaymentStatus paymentStatus) {
        return orderService.updatePaymentStatus(id, paymentStatus);
    }

    // =========================
    // XÓA MỀM
    // =========================
    @PreAuthorize("hasAuthority('ORDER_DELETE')")
    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }
}