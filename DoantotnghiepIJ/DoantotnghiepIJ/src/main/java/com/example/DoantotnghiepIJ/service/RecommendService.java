package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.entity.MenuItem;
import com.example.DoantotnghiepIJ.repository.MenuItemRepository;
import com.example.DoantotnghiepIJ.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendService {

    private final OrderItemRepository orderItemRepository;
    private final MenuItemRepository menuItemRepository;

    public List<MenuItem> recommend(Long userId) {
        String userIdStr = String.valueOf(userId);

        // Lấy top món user hay mua (dưới dạng chuỗi UUID)
        List<String> topItemIdsStr = orderItemRepository.findTopBoughtItems(userIdStr);

        // Nếu user mới → hiện best seller toàn hệ thống
        if (topItemIdsStr == null || topItemIdsStr.isEmpty()) {
            topItemIdsStr = orderItemRepository.findBestSellers();
            if (topItemIdsStr == null || topItemIdsStr.isEmpty()) {
                return new ArrayList<>(); // fallback safety
            }
            // Parse to UUID and fetch
            return topItemIdsStr.stream()
                    .map(this::parseUuidSafe)
                    .filter(Objects::nonNull)
                    .map(id -> menuItemRepository.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }

        Set<MenuItem> recommends = new LinkedHashSet<>();
        List<UUID> topItemIds = new ArrayList<>();

        for (String itemIdStr : topItemIdsStr) {
            UUID itemId = parseUuidSafe(itemIdStr);
            if (itemId == null) continue;
            
            topItemIds.add(itemId);

            MenuItem item = menuItemRepository.findById(itemId).orElse(null);

            if (item == null) {
                continue;
            }

            // Tìm món cùng category
            List<MenuItem> similarItems = menuItemRepository.findByCategory(item.getCategory());
            recommends.addAll(similarItems);
        }

        // Nếu không có similarItems nào, trả lại những item user hay mua
        if (recommends.isEmpty()) {
            return topItemIds.stream()
                    .map(id -> menuItemRepository.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .limit(10)
                    .collect(Collectors.toList());
        }

        // Lọc ra các món mà user chưa từng mua để đa dạng hóa (loại bỏ món đang có trong topItemIds),
        // ưu tiên các món gợi ý mới. Giới hạn 10 món.
        return recommends.stream()
                .filter(item -> !topItemIds.contains(item.getId()))
                .limit(10)
                .collect(Collectors.toList());
    }

    private UUID parseUuidSafe(String uuidStr) {
        if (uuidStr == null || uuidStr.isBlank()) return null;
        try {
            return UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}