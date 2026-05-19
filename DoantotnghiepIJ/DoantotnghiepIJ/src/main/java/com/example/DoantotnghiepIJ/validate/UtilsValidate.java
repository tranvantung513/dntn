package com.example.DoantotnghiepIJ.validate;

import com.example.DoantotnghiepIJ.exception.BadRequestException;

public class UtilsValidate {
    public static void validateEmail(String email) {
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("Invalid email format");
        }
    }

    public static void validatePhone(String phone) {
        if (phone == null || !phone.matches("^(0|\\+84)[0-9]{9}$")) {
            throw new RuntimeException("Invalid phone number");
        }
    }

    private static final String PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";

    public static void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new BadRequestException("Password is required");
        }

        if (!password.matches(PASSWORD_REGEX)) {
            throw new BadRequestException(
                    "Password must be at least 8 characters, include uppercase, lowercase, number and special character"
            );
        }
    }
}
