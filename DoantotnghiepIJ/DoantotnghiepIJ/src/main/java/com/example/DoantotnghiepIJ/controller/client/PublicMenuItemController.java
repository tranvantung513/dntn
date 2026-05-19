package com.example.DoantotnghiepIJ.controller.client;

import com.example.DoantotnghiepIJ.dto.Menu.MenuItemDto;
import com.example.DoantotnghiepIJ.entity.MenuItem;
import com.example.DoantotnghiepIJ.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Public endpoint cho khách hàng — không yêu cầu xác thực.
 * Được whitelist trong SecurityConfig tại /api/menu-items/**
 */
@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class PublicMenuItemController {

    private final MenuItemService menuItemService;

    /** Lấy tất cả món ăn (có phân trang) */
    @GetMapping
    public ResponseEntity<Page<MenuItem>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(menuItemService.getAll(page, size, sortBy, sortDir));
    }

    /** Lấy món ăn theo ID */
    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(menuItemService.getById(id));
    }

    /** Tìm kiếm món ăn (dùng cho search bar) */
    @GetMapping("/search")
    public ResponseEntity<Page<MenuItem>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(
                menuItemService.search(keyword, true, categoryId, page, size, sortBy, sortDir)
        );
    }

    /** Lấy nhiều món theo danh sách ID — dùng nội bộ cho CartService (ProductClient) */
    @PostMapping("/batch")
    public ResponseEntity<List<MenuItemDto>> getBatch(@RequestBody List<UUID> ids) {
        return ResponseEntity.ok(menuItemService.getByIds(ids));
    }
}
