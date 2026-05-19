package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.dto.role.RoleRequest;
import com.example.DoantotnghiepIJ.dto.role.RoleResponse;
import com.example.DoantotnghiepIJ.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("admin/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    // ================= GET ALL =================
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public List<RoleResponse> getAll() {
        return roleService.getAll();
    }

    // ================= GET BY ID =================
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public RoleResponse getById(
            @PathVariable UUID id
    ) {
        return roleService.getById(id);
    }

    // ================= CREATE =================
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public RoleResponse create(
            @RequestBody RoleRequest request
    ) {
        return roleService.create(request);
    }

    // ================= UPDATE =================
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleResponse update(
            @PathVariable UUID id,
            @RequestBody RoleRequest request
    ) {
        return roleService.update(id, request);
    }

    // ================= DELETE =================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public void delete(@PathVariable UUID id) {
        roleService.delete(id);
    }

    // ================= ASSIGN PERMISSIONS =================
    @PostMapping("/{roleId}/permissions")
    @PreAuthorize("hasAuthority('ROLE_ASSIGN_PERMISSION')")
    public void assignPermissions(
            @PathVariable UUID roleId,
            @RequestBody List<UUID> permissionIds
    ) {
        roleService.assignPermissions(roleId, permissionIds);
    }

    // ================= ENABLE ROLE =================
    @PutMapping("/{id}/enable")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public String enable(@PathVariable UUID id) {
        roleService.enable(id);
        return "Role enabled successfully";
    }

    // ================= GET ROLE PERMISSIONS =================
    @GetMapping("/{roleId}/permissions")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public List<UUID> getPermissionsByRole(
            @PathVariable UUID roleId
    ) {
        return roleService.getPermissionIdsByRole(roleId);
    }

    // ================= DISABLE ROLE =================
    @PutMapping("/{id}/disable")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public String disable(@PathVariable UUID id) {
        roleService.disable(id);
        return "Role disabled successfully";
    }

    // ================= GET PERMISSION MATRIX =================
    @GetMapping("/{id}/permission-matrix")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public Map<String, Map<String, Boolean>> getMatrix(
            @PathVariable UUID id
    ) {
        return roleService.getPermissionMatrix(id);
    }

    // ================= UPDATE PERMISSION MATRIX =================
    @PostMapping("/{id}/permission-matrix")
    @PreAuthorize("hasAuthority('ROLE_ASSIGN_PERMISSION')")
    public void updateMatrix(
            @PathVariable UUID id,
            @RequestBody Map<String, List<String>> request
    ) {
        roleService.updatePermissionMatrix(id, request);
    }
}