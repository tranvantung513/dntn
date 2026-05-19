package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.role.RoleRequest;
import com.example.DoantotnghiepIJ.dto.role.RoleResponse;
import com.example.DoantotnghiepIJ.entity.Permission;
import com.example.DoantotnghiepIJ.entity.Role;
import com.example.DoantotnghiepIJ.mapper.RoleMapper;
import com.example.DoantotnghiepIJ.repository.PermissionRepository;
import com.example.DoantotnghiepIJ.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final PermissionRepository permissionRepository;
    public RoleResponse create(RoleRequest request) {
        if (roleRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Role code already exists");
        }

        Role role = roleMapper.toEntity(request);
        role.setIsActive(true);
        return roleMapper.toResponse(roleRepository.save(role));
    }
    
    public List<RoleResponse> getAll() {
        return roleRepository.findAll().stream()
                .filter(r -> Boolean.FALSE.equals(r.getIsDeleted()))
//                .filter(r -> Boolean.TRUE.equals(r.getIsActive()))
                .map(roleMapper::toResponse)
                .toList();
    }

    public RoleResponse getById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        return roleMapper.toResponse(role);
    }

    public RoleResponse update(UUID id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role.setUpdatedAt(LocalDateTime.now());

        return roleMapper.toResponse(roleRepository.save(role));
    }

    public void delete(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if ("ROLE_ADMIN".equals(role.getCode()) || "ADMIN".equals(role.getCode())) {
            throw new RuntimeException("Không thể xóa quyền Quản trị viên cấp cao (ADMIN)");
        }

        role.setIsDeleted(true);
        role.setUpdatedAt(LocalDateTime.now());

        roleRepository.save(role);
    }

    public void assignPermissions(UUID roleId, List<UUID> permissionIds) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if (Boolean.TRUE.equals(role.getIsDeleted())) {
            throw new RuntimeException("Role is deleted");
        }

        if (!Boolean.TRUE.equals(role.getIsActive())) {
            throw new RuntimeException("Role is inactive");
        }

        List<Permission> permissions = permissionRepository.findAllById(permissionIds);

        role.setPermissions(new HashSet<>(permissions));

        roleRepository.save(role);
    }

    public List<UUID> getPermissionIdsByRole(UUID roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        return role.getPermissions()
                .stream()
                .map(Permission::getId)
                .toList();
    }
    public void enable(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setIsActive(true);
        role.setUpdatedAt(LocalDateTime.now());

        roleRepository.save(role);
    }

    public void disable(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        if ("ROLE_ADMIN".equals(role.getCode()) || "ADMIN".equals(role.getCode())) {
            throw new RuntimeException("Không thể vô hiệu hóa quyền Quản trị viên cấp cao (ADMIN)");
        }

        role.setIsActive(false);
        role.setUpdatedAt(LocalDateTime.now());

        roleRepository.save(role);
    }

    public Map<String, Map<String, Boolean>> getPermissionMatrix(UUID roleId) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        var rolePermissionCodes = role.getPermissions()
                .stream()
                .map(Permission::getCode)
                .collect(java.util.stream.Collectors.toSet());

        var allPermissions = permissionRepository.findAllByIsDeletedFalse();

        Map<String, Map<String, Boolean>> result = new HashMap<>();

        for (Permission p : allPermissions) {

            String module = p.getModule();
            String action = extractAction(p.getCode());

            result.putIfAbsent(module, new HashMap<>());

            result.get(module).put(
                    action,
                    rolePermissionCodes.contains(p.getCode())
            );
        }

        return result;
    }

    private String extractAction(String code) {
        return code.substring(code.lastIndexOf("_") + 1);
    }

    public void updatePermissionMatrix(UUID roleId,
                                       Map<String, List<String>> request) {

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        var allPermissions = permissionRepository.findAllByIsDeletedFalse();

        Set<Permission> newPermissions = new HashSet<>();

        for (Permission p : allPermissions) {

            String module = p.getModule();
            String action = extractAction(p.getCode());

            if (request.containsKey(module) &&
                    request.get(module).contains(action)) {

                newPermissions.add(p);
            }
        }

        role.setPermissions(newPermissions);

        roleRepository.save(role);
    }
}