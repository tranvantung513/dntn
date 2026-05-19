package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.Enum.OrderStatus;
import com.example.DoantotnghiepIJ.Enum.PaymentStatus;
import com.example.DoantotnghiepIJ.entity.Order;
import com.example.DoantotnghiepIJ.entity.MenuItem;
import com.example.DoantotnghiepIJ.repository.MenuItemRepository;
import com.example.DoantotnghiepIJ.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;

    // =========================
    // LẤY CHI TIẾT
    // =========================
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    // =========================
    // TẠO ĐƠN HÀNG
    // =========================
    @Transactional
    public Order createOrder(Order order) {

        // ❗ userId phải được set từ Controller
        if (order.getUserId() == null) {
            throw new RuntimeException("userId is required");
        }

        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        // Gán quan hệ Order - OrderItem và trừ kho
        order.getItems().forEach(item -> {
            item.setOrder(order);
            // Trừ tồn kho
            if (item.getMenuItemId() != null) {
                MenuItem menuItem = menuItemRepository.findById(UUID.fromString(item.getMenuItemId()))
                        .orElseThrow(() -> new RuntimeException("Product not found: " + item.getMenuItemName()));
                
                if (menuItem.getQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Sản phẩm '" + menuItem.getName() + "' không đủ số lượng trong kho!");
                }
                menuItem.setQuantity(menuItem.getQuantity() - item.getQuantity());
                menuItemRepository.save(menuItem);
            }
        });

        return orderRepository.save(order);
    }

    // =========================
    // LẤY DANH SÁCH TẤT CẢ ĐƠN
    // =========================
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // =========================
    // LẤY ĐƠN THEO USER
    // =========================
    public List<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId);
    }

    // =========================
    // CẬP NHẬT ĐƠN
    // =========================
    public Order updateOrder(Long id, Order newOrder) {
        Order order = getOrderById(id);

        order.setReceiverName(newOrder.getReceiverName());
        order.setReceiverPhone(newOrder.getReceiverPhone());
        order.setShippingAddress(newOrder.getShippingAddress());
        order.setNote(newOrder.getNote());
        order.setUpdatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    // =========================
    // CẬP NHẬT TRẠNG THÁI
    // =========================
    @Transactional
    public Order updateStatus(Long id, OrderStatus status) {
        Order order = getOrderById(id);
        
        // Nếu chuyển sang trạng thái CANCELLED và trước đó không phải là CANCELLED thì hoàn lại số lượng
        if (status == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            order.getItems().forEach(item -> {
                if (item.getMenuItemId() != null) {
                    menuItemRepository.findById(UUID.fromString(item.getMenuItemId())).ifPresent(menuItem -> {
                        menuItem.setQuantity(menuItem.getQuantity() + item.getQuantity());
                        menuItemRepository.save(menuItem);
                    });
                }
            });
        }
        
        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    // =========================
    // CẬP NHẬT THANH TOÁN
    // =========================
    public Order updatePaymentStatus(Long id, PaymentStatus paymentStatus) {
        Order order = getOrderById(id);
        order.setPaymentStatus(paymentStatus);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    // =========================
    // XÓA MỀM
    // =========================
    public void deleteOrder(Long id) {
        Order order = getOrderById(id);
        order.setDeleted(true);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }
}