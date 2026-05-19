package com.example.DoantotnghiepIJ.service.chatbot;

import com.example.DoantotnghiepIJ.entity.MenuItem;
import com.example.DoantotnghiepIJ.service.MenuItemService;
import com.example.DoantotnghiepIJ.service.chatbot.context.ContextBuilder;
import com.example.DoantotnghiepIJ.service.chatbot.intent.IntentService;
import com.example.DoantotnghiepIJ.service.chatbot.memory.ConversationMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import com.example.DoantotnghiepIJ.service.DiscountService;
import com.example.DoantotnghiepIJ.service.SettingService;
import com.example.DoantotnghiepIJ.entity.Discount;
import com.example.DoantotnghiepIJ.entity.Setting;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MenuItemService menuService;
    private final IntentService intentService;
    private final ContextBuilder contextBuilder;
    private final AIService aiService;
    private final ConversationMemoryService memoryService;
    private final DiscountService discountService;
    private final SettingService settingService;

    public String chat(String sessionId, String message) {

        memoryService.add(sessionId, "user", message);

        String intent = intentService.detect(message);

        List<MenuItem> items;

        switch (intent) {
            case "MENU":
                items = menuService.getAllForChat();
                break;

            case "COMBO":
                items = menuService.getComboForChat();
                break;

            case "FEATURED":
                items = menuService.getFeaturedForChat();
                break;

            case "PRICE":
                Double price = intentService.extractPrice(message);
                items = menuService.getByPriceForChat(
                        price != null ? price : 50000.0
                );
                break;

            default:
                items = menuService.searchForChat(message);
                if (items == null || items.isEmpty()) {
                    items = menuService.getAllForChat();
                }
        }

        String menuContext = contextBuilder.build(items);
        
        // Bơm thông tin Cài đặt
        Map<String, String> settings = settingService.getAllSettingsAsMap();
        String settingsContext = "\n### 🏪 THÔNG TIN NHÀ HÀNG\n";
        settingsContext += "- **Tên:** " + settings.getOrDefault("store_name", "Saffron Harvest") + "\n";
        settingsContext += "- **Địa chỉ:** " + settings.getOrDefault("store_address", "Đang cập nhật") + "\n";
        settingsContext += "- **Giờ mở cửa:** " + settings.getOrDefault("opening_hours", "Đang cập nhật") + "\n";
        settingsContext += "- **SĐT:** " + settings.getOrDefault("store_phone", "Đang cập nhật") + "\n";
        
        // Bơm thông tin Khuyến mãi
        List<Discount> activeDiscounts = discountService.getActiveDiscounts();
        String promoContext = "\n### 🎁 KHUYẾN MÃI HIỆN TẠI\n";
        if (activeDiscounts.isEmpty()) {
            promoContext += "Hiện tại chưa có khuyến mãi.\n";
        } else {
            for (Discount d : activeDiscounts) {
                promoContext += String.format("- **%s** (Mã: `%s`): Giảm %s%%, Tối đa %s VNĐ, Đơn tối thiểu %s VNĐ.\n", 
                    d.getName(), d.getCode(), d.getDiscountValue(), d.getMaxDiscount(), d.getMinOrderValue());
            }
        }

        String context = menuContext + "\n" + settingsContext + "\n" + promoContext;

        List<Map<String, String>> history = memoryService.get(sessionId);

        String reply = aiService.ask(message, context, history);

        memoryService.add(sessionId, "assistant", reply);

        return reply;
    }
}