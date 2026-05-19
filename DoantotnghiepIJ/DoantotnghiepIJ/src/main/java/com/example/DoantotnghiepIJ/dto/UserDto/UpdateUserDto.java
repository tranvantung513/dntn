package com.example.DoantotnghiepIJ.dto.UserDto;

import com.example.DoantotnghiepIJ.Enum.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDto {
    private String fullName;
    private String phone;
    private LocalDateTime dateOfBirth;
    private String email;
    private String gender;
    private String avatarUrl;
    private UserStatus status;
}
