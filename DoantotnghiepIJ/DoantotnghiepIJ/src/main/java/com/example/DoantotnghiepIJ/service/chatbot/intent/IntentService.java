package com.example.DoantotnghiepIJ.service.chatbot.intent;

import org.springframework.stereotype.Service;

import java.util.regex.*;

@Service
public class IntentService {

    public String detect(String message) {
        String msg = message.toLowerCase();

        if (msg.contains("combo")) return "COMBO";
        if (msg.contains("nổi bật") || msg.contains("best")) return "FEATURED";
        if (msg.contains("rẻ") || msg.contains("dưới")) return "PRICE";

        // Khi hỏi chung về menu / thực đơn
        if (msg.contains("menu") || msg.contains("thực đơn")
                || msg.contains("có gì") || msg.contains("có món gì")
                || msg.contains("món ăn") || msg.contains("danh sách")
                || msg.contains("gửi menu") || msg.contains("xem menu")) return "MENU";

        return "SEARCH";
    }

    public Double extractPrice(String message) {
        Pattern p = Pattern.compile("(\\d+)");
        Matcher m = p.matcher(message);

        if (m.find()) {
            return Double.parseDouble(m.group(1)) * 1000;
        }

        return null;
    }
}