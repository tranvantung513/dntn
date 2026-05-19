package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.dto.Menu.MenuItemDto;
import com.example.DoantotnghiepIJ.entity.MenuItem;
import com.example.DoantotnghiepIJ.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/v1/admin/menu-items")
@RequiredArgsConstructor
public class MenuItemController {

    private final MenuItemService menuItemService;

    // ================= CREATE =================
    @PostMapping("/batch")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public List<MenuItemDto> getByIds(@RequestBody List<UUID> ids) {
        return menuItemService.getByIds(ids);
    }

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    public ResponseEntity<?> create(@RequestBody MenuItemDto dto) {
        return ResponseEntity.ok(menuItemService.create(dto));
    }

    // ================= GET ALL =================
    @GetMapping
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ResponseEntity<Page<MenuItem>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        return ResponseEntity.ok(
                menuItemService.getAll(page, size, sortBy, sortDir)
        );
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ResponseEntity<MenuItem> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(menuItemService.getById(id));
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<MenuItem> update(
            @PathVariable UUID id,
            @RequestBody MenuItemDto dto
    ) {
        return ResponseEntity.ok(menuItemService.update(id, dto));
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        menuItemService.delete(id);
        return ResponseEntity.ok("Deleted successfully");
    }

    // ================= TOGGLE STATUS =================
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<?> toggleStatus(@PathVariable UUID id) {
        menuItemService.toggleStatus(id);
        return ResponseEntity.ok("Status updated");
    }

    // ================= SEARCH =================
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ResponseEntity<Page<MenuItem>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(
                menuItemService.search(
                        keyword,
                        isActive,
                        categoryId,
                        page,
                        size,
                        sortBy,
                        sortDir
                )
        );
    }

    // ================= UPLOAD IMAGES =================
    @PostMapping("/{id}/upload-images")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<?> uploadImages(
            @PathVariable UUID id,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) {
        menuItemService.uploadImages(id, thumbnail, images);
        return ResponseEntity.ok("Upload thành công");
    }

    // ================= DASHBOARD =================
    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('PRODUCT_VIEW')")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(menuItemService.getDashboardStats());
    }

    // ================= FEATURE =================
    @PutMapping("/{id}/feature")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<MenuItemDto> toggleFeature(@PathVariable UUID id) {
        return ResponseEntity.ok(menuItemService.toggleFeature(id));
    }

    // ================= INCREASE STOCK =================
    @PutMapping("/{id}/increase-stock")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<?> increaseStock(
            @PathVariable UUID id,
            @RequestParam int amount
    ) {
        menuItemService.increaseStock(id, amount);
        return ResponseEntity.ok("Nhập kho thành công");
    }

    // ================= DECREASE STOCK =================
    @PutMapping("/{id}/decrease-stock")
    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    public ResponseEntity<?> decreaseStock(
            @PathVariable UUID id,
            @RequestParam int amount
    ) {
        menuItemService.decreaseStock(id, amount);
        return ResponseEntity.ok("Xuất kho thành công");
    }
}