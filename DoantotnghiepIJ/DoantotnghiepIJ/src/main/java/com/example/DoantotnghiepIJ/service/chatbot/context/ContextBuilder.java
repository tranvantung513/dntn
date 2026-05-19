package com.example.DoantotnghiepIJ.service.chatbot.context;

import com.example.DoantotnghiepIJ.entity.MenuItem;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContextBuilder {

    public String build(List<MenuItem> items) {

        if (items == null || items.isEmpty()) {
            return "### 📋 THỰC ĐƠN\nHiện tại không có món phù hợp.\n";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("### 📋 THỰC ĐƠN HIỆN CÓ\n");
        sb.append("| ID | Tên món | Giá (VNĐ) | Danh mục | Mô tả |\n");
        sb.append("|---|---|---|---|---|\n");

        for (MenuItem m : items) {

            double price = m.getDiscountPrice() != null
                    ? m.getDiscountPrice()
                    : m.getPrice();

            sb.append("| ")
                    .append(m.getId())
                    .append(" | ")
                    .append(m.getName() != null ? m.getName().replace("|", "") : "")
                    .append(" | ")
                    .append(price)
                    .append(" | ")
                    .append(m.getCategory() != null ? m.getCategory().getName() : "Chưa phân loại")
                    .append(" | ")
                    .append(m.getDescription() != null ? m.getDescription().replace("\n", " ").replace("|", "") : "")
                    .append(" |\n");
        }

        return sb.toString();
    }
}