package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.Enum.PaymentMethod;
import com.example.DoantotnghiepIJ.Enum.PaymentStatus;
import com.example.DoantotnghiepIJ.dto.vietqr.VietQRResponseDTO;
import com.example.DoantotnghiepIJ.entity.Order;
import com.example.DoantotnghiepIJ.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVietQrService {

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${vietqr.accountNo}")
    private String accountNo;

    @Value("${vietqr.accountName}")
    private String accountName;

    @Value("${vietqr.bankCode}")
    private String bankCode;

    private static final String VIETQR_API = "https://api.vietqr.io/v2/generate";

    // ================== CREATE QR ==================
    public VietQRResponseDTO createVietQR(Long orderId) {

        log.info("Generating VietQR for order {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getTotalAmount() == null) {
            throw new RuntimeException("Order amount is null");
        }

        // Nội dung chuyển khoản
        String paymentContent = "ORDER_" + orderId;

        Map<String, Object> body = new HashMap<>();
        body.put("accountNo", accountNo);
        body.put("accountName", accountName);
        body.put("acqId", bankCode);
        body.put("amount", order.getTotalAmount().longValue());
        body.put("addInfo", paymentContent);
        body.put("format", "text");
        body.put("template", "compact");

        Map response = restTemplate.postForObject(VIETQR_API, body, Map.class);

        if (response == null || response.get("data") == null) {
            throw new RuntimeException("VietQR API error");
        }

        Map data = (Map) response.get("data");
        String qrBase64 = (String) data.get("qrDataURL");

        log.info("QR generated for order {}: {}", orderId, qrBase64);

        // ❌ KHÔNG lưu QR vào DB nữa
        order.setPaymentMethod(PaymentMethod.VIETQR);
        order.setPaymentStatus(PaymentStatus.PENDING);// Tạm set là REFUNDED để dễ test, sau này sẽ có trạng thái mới "AWAITING_PAYMENT"
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Response trả về cho FE
        VietQRResponseDTO result = new VietQRResponseDTO();
        result.setQrCodeBase64(qrBase64);
        result.setPaymentContent(paymentContent);
        result.setAmount(order.getTotalAmount().longValue());

        return result;
    }

    // ================== CONFIRM ==================
    public void confirmPayment(Long orderId) {

        log.info("Confirm payment for order {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setUpdatedAt(LocalDateTime.now());

        orderRepository.save(order);
    }

    // ================== AUTO CANCEL ==================
    @Scheduled(fixedRate = 300000) // 5 phút
    public void cancelExpiredOrders() {

        log.info("Running auto cancel job...");

        List<Order> orders = orderRepository.findPendingOrders();

        for (Order order : orders) {

            if (order.getCreatedAt() != null &&
                    order.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(5))) {

                order.setPaymentStatus(PaymentStatus.EXPIRED);// Tạm set là UNPAID để dễ test, sau này sẽ có trạng thái mới "EXPIRED"
                order.setUpdatedAt(LocalDateTime.now());

                orderRepository.save(order);

                log.info("Cancelled order {}", order.getId());
            }
        }
    }
}