package com.example.DoantotnghiepIJ.mapper;

import com.example.DoantotnghiepIJ.dto.UserDto.CreateUserDto;
import com.example.DoantotnghiepIJ.dto.UserDto.UpdateUserDto;
import com.example.DoantotnghiepIJ.dto.UserDto.UserResponseDto;
import com.example.DoantotnghiepIJ.entity.User;

public class UserMapper {

    //  Entity → Response DTO
    public static UserResponseDto toResponseDto(User user) {
        if (user == null) return null;

        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setEmail(user.getEmail());
        dto.setPublicId(user.getPublicId());

        // KHÔNG trả status nếu bạn không muốn hiển thị

        return dto;
    }

    //  CREATE DTO → Entity
    public static User toEntity(CreateUserDto dto) {
        if (dto == null) return null;

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        user.setEmail(dto.getEmail());

        // ⚠ password sẽ được hash ở service
        user.setPasswordHash(dto.getPassword());

        return user;
    }

    //  UPDATE DTO → Entity (patch)
    public static void updateEntity(User user, UpdateUserDto dto) {
        if (user == null || dto == null) return;

        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
        }

        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }

        if (dto.getEmail() != null) {
            user.setEmail(dto.getEmail());
        }

        if (dto.getGender() != null) {
            user.setGender(dto.getGender());
        }

        if (dto.getDateOfBirth() != null) {
            user.setDateOfBirth(dto.getDateOfBirth());
        }

        if (dto.getAvatarUrl() != null) {
            user.setAvatarUrl(dto.getAvatarUrl());
        }

        //  nếu bạn cho phép update status
        if (dto.getStatus() != null) {
            user.setStatus(dto.getStatus());
        }
    }
}