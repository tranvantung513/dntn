package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.UserDto.CreateUserDto;
import com.example.DoantotnghiepIJ.dto.UserDto.UserStatisticsDto;
import com.example.DoantotnghiepIJ.entity.Role;
import com.example.DoantotnghiepIJ.entity.User;
import com.example.DoantotnghiepIJ.repository.RoleRepository;
import com.example.DoantotnghiepIJ.repository.UserRepository;
import com.example.DoantotnghiepIJ.exception.NotFoundException;
import com.example.DoantotnghiepIJ.exception.BadRequestException;
import com.example.DoantotnghiepIJ.Enum.UserStatus;
import com.example.DoantotnghiepIJ.validate.UtilsValidate;

import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       CloudinaryService cloudinaryService,
                       RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinaryService = cloudinaryService;
        this.roleRepository = roleRepository;
    }

    // ===================== GET ALL =====================
    public Page<User> getUsers(String keyword, UserStatus status, int page, int size) {

        if (page < 0) throw new BadRequestException("Page must >= 0");
        if (size <= 0 || size > 100) throw new BadRequestException("Size must be 1-100");

        if (keyword != null) {
            keyword = keyword.trim().toLowerCase();
            if (keyword.isEmpty()) keyword = null;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return userRepository.searchUsers(keyword, status, pageable);
    }

    // ===================== GET BY ID =====================
    public User getUserById(Long id) {
        if (id == null) throw new BadRequestException("Id is required");

        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
    }

    // ===================== CREATE =====================
    @Transactional
    public User createUser(CreateUserDto request) {

        if (request == null) {
            throw new BadRequestException("Request is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone() != null ? request.getPhone().trim() : null;
        String password = request.getPassword().trim();
        String fullName = request.getFullName() != null ? request.getFullName().trim() : null;

        UtilsValidate.validateEmail(email);
        UtilsValidate.validatePassword(password);
        if (phone != null) UtilsValidate.validatePhone(phone);

        userRepository.findByEmail(email)
                .ifPresent(u -> { throw new BadRequestException("Email already exists"); });

        if (phone != null) {
            userRepository.findByPhone(phone)
                    .ifPresent(u -> { throw new BadRequestException("Phone already exists"); });
        }

        // lấy role mặc định
        Role roleUser = roleRepository.findByCode("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role USER not found"));

        User user = new User();
        user.setEmail(email);
        user.setPhone(phone);
        user.setFullName(fullName);
        user.setDateOfBirth(request.getDateOfBirth());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setStatus(UserStatus.ACTIVE);
        user.setDeleted(false);
        user.setRole(roleUser); // ✅ 1 user - 1 role

        return userRepository.save(user);
    }

    // ===================== UPDATE =====================
    public User updateUser(Long id, User request) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (Boolean.TRUE.equals(existingUser.getDeleted())) {
            throw new BadRequestException("User has been deleted");
        }

        if (existingUser.getStatus() == UserStatus.INACTIVE) {
            throw new BadRequestException("User is disabled");
        }

        if (request.getEmail() != null) {
            String email = request.getEmail().trim().toLowerCase();

            if (!email.equals(existingUser.getEmail())) {
                UtilsValidate.validateEmail(email);

                userRepository.findByEmail(email)
                        .ifPresent(u -> { throw new BadRequestException("Email already exists"); });

                existingUser.setEmail(email);
            }
        }

        if (request.getPhone() != null) {
            String phone = request.getPhone().trim();

            if (!phone.equals(existingUser.getPhone())) {
                UtilsValidate.validatePhone(phone);

                userRepository.findByPhone(phone)
                        .ifPresent(u -> { throw new BadRequestException("Phone already exists"); });

                existingUser.setPhone(phone);
            }
        }

        if (request.getFullName() != null) {
            existingUser.setFullName(request.getFullName().trim());
        }

        if (request.getGender() != null) {
            existingUser.setGender(request.getGender());
        }

        if (request.getDateOfBirth() != null) {
            if (request.getDateOfBirth().isAfter(LocalDateTime.now())) {
                throw new BadRequestException("Date of birth is invalid");
            }
            existingUser.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(request.getAvatarUrl());
        }

        if (request.getStatus() != null) {
            existingUser.setStatus(request.getStatus());
        }

        if (request.getPasswordHash() != null) {
            String password = request.getPasswordHash().trim();
            UtilsValidate.validatePassword(password);
            existingUser.setPasswordHash(passwordEncoder.encode(password));
        }

        return userRepository.save(existingUser);
    }

    // ===================== UPDATE ROLE =====================
    @Transactional
    public void updateUserRole(Long userId, String roleCode) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleCode));

        user.setRole(role);

        userRepository.save(user);
    }

    // ===================== UPDATE STATUS =====================
    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (status == null) {
            throw new BadRequestException("Status is required");
        }

        user.setStatus(status);
        userRepository.save(user);
    }

    // ===================== UPLOAD AVATAR =====================


    // ===================== DELETE =====================
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setDeleted(true);
        userRepository.save(user);
    }

    // ===================== STATISTICS =====================
    public UserStatisticsDto getUserStatistics() {

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long newUsersToday = userRepository.countUsersCreatedToday(LocalDate.now());

        return UserStatisticsDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .newUsersToday(newUsersToday)
                .build();
    }


}
