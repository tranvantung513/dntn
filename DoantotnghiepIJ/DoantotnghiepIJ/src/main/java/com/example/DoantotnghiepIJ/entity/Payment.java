package com.example.DoantotnghiepIJ.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    private String method; // VNPAY

    private long amount;

    private String status; // INIT, SUCCESS, FAILED

    private String txnRef;

    private String transactionNo;

    private LocalDateTime createdAt;
}