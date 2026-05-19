package com.example.DoantotnghiepIJ.controller;

import com.example.DoantotnghiepIJ.config.VnPayConfig;
import com.example.DoantotnghiepIJ.entity.Order;
import com.example.DoantotnghiepIJ.repository.OrderRepository;
import com.example.DoantotnghiepIJ.repository.PaymentRepository;
import com.example.DoantotnghiepIJ.service.PaymentService;
import com.example.DoantotnghiepIJ.util.VnPayUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final OrderRepository orderRepo;
    private final PaymentRepository paymentRepo;
    private final VnPayConfig vnpayConfig;
    @PostMapping("/vnpay/{orderId}")
    public ResponseEntity<?> create(@PathVariable Long orderId,
                                    jakarta.servlet.http.HttpServletRequest req) {

        Order order = orderRepo.findById(orderId).orElseThrow();

        String url = paymentService.createVnPayPayment(order, req);

        return ResponseEntity.ok(Map.of("paymentUrl", url));
    }

    @PostMapping("/vnpay-ipn")
    public ResponseEntity<?> ipn(@RequestParam Map<String, String> params) {

        String secureHash = params.remove("vnp_SecureHash");

        String hashData = params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));

        String check = VnPayUtil.hmacSHA512(
                vnpayConfig.getSecretKey(),
                hashData
        );

        if (!check.equals(secureHash)) {
            return ResponseEntity.ok(Map.of("RspCode", "97"));
        }

        String txnRef = params.get("vnp_TxnRef");

        var payment = paymentRepo.findByTxnRef(txnRef).orElseThrow();
        var order = orderRepo.findById(payment.getOrder().getId()).orElseThrow();

        if ("00".equals(params.get("vnp_ResponseCode"))) {
            payment.setStatus("SUCCESS");
            payment.setTransactionNo(params.get("vnp_TransactionNo"));

            order.setPaymentStatus(com.example.DoantotnghiepIJ.Enum.PaymentStatus.PAID);
            order.setStatus(com.example.DoantotnghiepIJ.Enum.OrderStatus.CONFIRMED);
        } else {
            payment.setStatus("FAILED");
        }

        paymentRepo.save(payment);
        orderRepo.save(order);

        return ResponseEntity.ok(Map.of("RspCode", "00"));
    }
}