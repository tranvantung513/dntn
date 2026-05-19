package com.example.DoantotnghiepIJ.controller.client;

import com.example.DoantotnghiepIJ.dto.UserDto.CreateUserDto;
import com.example.DoantotnghiepIJ.dto.login.ForgotPasswordRequest;
import com.example.DoantotnghiepIJ.dto.login.LoginRequest;
import com.example.DoantotnghiepIJ.dto.login.LoginResponse;
import com.example.DoantotnghiepIJ.service.AuthService;
import com.example.DoantotnghiepIJ.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    // 📝 REGISTER (public — sau khi OTP đã xác thực)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CreateUserDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request,
                                    HttpServletResponse response) {

        authService.logout(request, response);

        return ResponseEntity.ok("Logout successful");
    }

    // 🔐 LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest,
                                   HttpServletResponse response) {

        // ✅ Lấy device + IP
        String userAgent = httpRequest.getHeader("User-Agent");
        String clientIp = httpRequest.getRemoteAddr();

        return ResponseEntity.ok(
                authService.login(request, response, userAgent, clientIp)
        );
    }

    // 🔄 REFRESH TOKEN
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request,
                                          HttpServletResponse response) {

        String userAgent = request.getHeader("User-Agent");
        String clientIp = request.getRemoteAddr();

        LoginResponse result = authService.refreshToken(
                request,
                response,
                userAgent,
                clientIp
        );

        return ResponseEntity.ok(result);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request);

        return ResponseEntity.ok("Password reset successful");
    }
}