package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.dto.Table.RestaurantTableRequest;
import com.example.DoantotnghiepIJ.dto.Table.RestaurantTableResponse;
import com.example.DoantotnghiepIJ.service.RestaurantTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/tables")
@RequiredArgsConstructor
public class RestaurantTableController {

    private final RestaurantTableService service;

    // ================= GET ALL =================
    @GetMapping
    @PreAuthorize("hasAuthority('TABLE_VIEW')")
    public List<RestaurantTableResponse> getAll() {
        return service.getAll();
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('TABLE_VIEW')")
    public RestaurantTableResponse getById(
            @PathVariable UUID id
    ) {
        return service.getById(id);
    }

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasAuthority('TABLE_CREATE')")
    public RestaurantTableResponse create(
            @RequestBody RestaurantTableRequest request
    ) {
        return service.create(request);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('TABLE_UPDATE')")
    public RestaurantTableResponse update(
            @PathVariable UUID id,
            @RequestBody RestaurantTableRequest request
    ) {
        return service.update(id, request);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('TABLE_DELETE')")
    public String delete(@PathVariable UUID id) {
        service.delete(id);
        return "Deleted successfully";
    }
}