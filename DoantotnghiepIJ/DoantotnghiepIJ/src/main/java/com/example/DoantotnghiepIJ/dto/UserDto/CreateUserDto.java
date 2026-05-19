package com.example.DoantotnghiepIJ.dto.UserDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserDto {
    private String fullName;
    private LocalDateTime dateOfBirth;
    private String phone;
    private String email;
    private String password;
}

