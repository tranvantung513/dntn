package com.example.DoantotnghiepIJ.config;

import com.example.DoantotnghiepIJ.entity.Role;
import com.example.DoantotnghiepIJ.repository.PermissionRepository;
import com.example.DoantotnghiepIJ.repository.RoleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Component
@DependsOn("permissionSeeder")
@RequiredArgsConstructor
public class RoleSeeder {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @PostConstruct
    public void seedRolePermission() {
        // 1. Ensure 4 default roles exist
        List<Role> defaultRoles = List.of(
                Role.builder().code("ROLE_ADMIN").name("Quản trị viên").description("Quản trị viên hệ thống").isActive(true).isSystem(true).build(),
                Role.builder().code("ROLE_USER").name("Khách hàng").description("Người dùng cơ bản").isActive(true).isSystem(true).build(),
                Role.builder().code("ROLE_STAFF").name("Nhân viên").description("Nhân viên nhà hàng").isActive(true).isSystem(true).build(),
                Role.builder().code("ROLE_MANAGER").name("Quản lý").description("Quản lý nhà hàng").isActive(true).isSystem(true).build()
        );

        for (Role r : defaultRoles) {
            if (roleRepository.findByCode(r.getCode()).isEmpty()) {
                r.setCreatedAt(LocalDateTime.now());
                r.setUpdatedAt(LocalDateTime.now());
                roleRepository.save(r);
                System.out.println("Đã tạo Role mới: " + r.getCode());
            }
        }

        // 2. Grant full permissions to ROLE_ADMIN
        Role admin = roleRepository.findByCode("ROLE_ADMIN").orElse(null);

        if (admin != null) {
            var permissions = permissionRepository.findAll();
            admin.setPermissions(new HashSet<>(permissions));
            roleRepository.save(admin);
            System.out.println("Đã gán full " + permissions.size() + " quyền cho ROLE_ADMIN");
        } else {
            System.out.println("Không tìm thấy role ADMIN để gán quyền");
        }
    }
}