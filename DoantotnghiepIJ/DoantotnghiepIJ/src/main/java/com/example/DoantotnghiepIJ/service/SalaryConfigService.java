package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.Salary.SalaryConfigRequest;
import com.example.DoantotnghiepIJ.dto.Salary.SalaryConfigResponse;
import com.example.DoantotnghiepIJ.entity.SalaryConfig;
import com.example.DoantotnghiepIJ.entity.User;
import com.example.DoantotnghiepIJ.repository.SalaryConfigRepository;
import com.example.DoantotnghiepIJ.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryConfigService {

    private final SalaryConfigRepository salaryConfigRepository;
    private final UserRepository userRepository;

    private static final Set<String> ALLOWED_ROLES =
            Set.of("ROLE_STAFF", "ROLE_MANAGER");

    // ==================== CREATE ====================
    public SalaryConfigResponse create(SalaryConfigRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        validateUser(user);
        validateSalary(request.getSalaryPerHour());

        if (salaryConfigRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("User đã có cấu hình lương");
        }

        SalaryConfig entity = SalaryConfig.builder()
                .userId(request.getUserId())
                .position(request.getPosition())
                .salaryPerHour(request.getSalaryPerHour())
                .build();

        salaryConfigRepository.save(entity);

        return mapToResponse(entity, getUserName(user));
    }

    // ==================== UPDATE ====================
    public SalaryConfigResponse update(Long id, SalaryConfigRequest request) {

        SalaryConfig entity = salaryConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy SalaryConfig"));

        // ❗ KHÔNG cho đổi userId
        User user = userRepository.findById(entity.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        validateUser(user);
        validateSalary(request.getSalaryPerHour());

        entity.setPosition(request.getPosition());
        entity.setSalaryPerHour(request.getSalaryPerHour());

        salaryConfigRepository.save(entity);

        return mapToResponse(entity, getUserName(user));
    }

    // ==================== DELETE ====================
    public void delete(Long id) {
        SalaryConfig entity = salaryConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy"));

        salaryConfigRepository.delete(entity);
    }

    // ==================== GET BY ID ====================
    public SalaryConfigResponse getById(Long id) {

        SalaryConfig entity = salaryConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy"));

        User user = userRepository.findById(entity.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return mapToResponse(entity, getUserName(user));
    }

    // ==================== GET ALL ====================
    public List<SalaryConfigResponse> getAll() {

        List<SalaryConfig> list = salaryConfigRepository.findAll();

        if (list.isEmpty()) return Collections.emptyList();

        // 🔥 tránh N+1 query
        List<Long> userIds = list.stream()
                .map(SalaryConfig::getUserId)
                .toList();

        Map<Long, User> userMap = userRepository.findAllById(userIds)
                .stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return list.stream().map(item -> {
            User user = userMap.get(item.getUserId());
            String name = user != null ? getUserName(user) : "Unknown";

            return mapToResponse(item, name);
        }).toList();
    }

    // ==================== VALIDATE ====================
    private void validateUser(User user) {
        String roleCode = user.getRole() != null ? user.getRole().getCode() : null;

        if (!ALLOWED_ROLES.contains(roleCode)) {
            throw new RuntimeException("Chỉ áp dụng cho STAFF và MANAGER");
        }
    }

    private void validateSalary(Double salary) {
        if (salary == null || salary <= 0) {
            throw new RuntimeException("Lương phải > 0");
        }
    }

    // ==================== HELPER ====================
    private String getUserName(User user) {
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            return "User#" + user.getId();
        }
        return user.getFullName();
    }

    private SalaryConfigResponse mapToResponse(SalaryConfig entity, String userName) {
        return SalaryConfigResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .userName(userName)
                .position(entity.getPosition())
                .salaryPerHour(entity.getSalaryPerHour())
                .build();
    }
}