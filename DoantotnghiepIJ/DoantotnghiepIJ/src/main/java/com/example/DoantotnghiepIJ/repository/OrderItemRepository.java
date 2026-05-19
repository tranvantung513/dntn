package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, String> {
    @Query(value = """
        SELECT oi.menu_item_id
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = :userId AND oi.menu_item_id IS NOT NULL AND oi.menu_item_id != ''
        GROUP BY oi.menu_item_id
        ORDER BY SUM(oi.quantity) DESC
        LIMIT 5
        """, nativeQuery = true)
    List<String> findTopBoughtItems(
            @Param("userId") String userId
    );

    @Query(value = """
        SELECT oi.menu_item_id
        FROM order_items oi
        WHERE oi.menu_item_id IS NOT NULL AND oi.menu_item_id != ''
        GROUP BY oi.menu_item_id
        ORDER BY SUM(oi.quantity) DESC
        LIMIT 10
        """, nativeQuery = true)
    List<String> findBestSellers();
}