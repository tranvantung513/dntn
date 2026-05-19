package com.example.DoantotnghiepIJ.dto.UserDto;

import com.example.DoantotnghiepIJ.Enum.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private UserStatus status;
    private String publicId;
}