package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.entity.Order;
import com.example.DoantotnghiepIJ.entity.Payment;
import com.example.DoantotnghiepIJ.repository.OrderRepository;
import com.example.DoantotnghiepIJ.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final OrderRepository orderRepo;
    private final VnPayService vnPayService;

    public String createVnPayPayment(Order order, HttpServletRequest req) {

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount().longValue());
        payment.setMethod("VNPAY");
        payment.setStatus("INIT");
        payment.setTxnRef("TXN_" + System.currentTimeMillis());
        payment.setCreatedAt(LocalDateTime.now());

        paymentRepo.save(payment);

        return vnPayService.createPaymentUrl(payment, req);
    }
}