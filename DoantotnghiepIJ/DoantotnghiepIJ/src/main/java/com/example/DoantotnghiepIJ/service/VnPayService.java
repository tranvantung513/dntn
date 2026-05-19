package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.config.VnPayConfig;
import com.example.DoantotnghiepIJ.entity.Payment;
import com.example.DoantotnghiepIJ.util.VnPayUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VnPayService {

    private final VnPayConfig config;

    public String createPaymentUrl(Payment payment, HttpServletRequest req) {

        Map<String, String> params = new HashMap<>();

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(payment.getAmount() * 100));
        params.put("vnp_CurrCode", "VND");

        // FIX txnRef
        String txnRef = String.valueOf(System.currentTimeMillis());
        params.put("vnp_TxnRef", txnRef);

        params.put("vnp_OrderInfo", "Thanh toan don hang " + payment.getOrder().getId());
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", config.getReturnUrl());

        // FIX IP
        String ip = req.getRemoteAddr();
        if (ip.equals("0:0:0:0:0:0:0:1")) {
            ip = "127.0.0.1";
        }
        params.put("vnp_IpAddr", ip);

        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));

        params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String key : keys) {
            String value = params.get(key);

            if (hashData.length() > 0) {
                hashData.append("&");
                query.append("&");
            }

            hashData.append(key).append("=").append(value);

            query.append(URLEncoder.encode(key, StandardCharsets.UTF_8))
                    .append("=")
                    .append(URLEncoder.encode(value, StandardCharsets.UTF_8));
        }

        String hash = VnPayUtil.hmacSHA512(config.getSecretKey(), hashData.toString());

        return config.getPayUrl() + "?" + query + "&vnp_SecureHash=" + hash;
    }
}