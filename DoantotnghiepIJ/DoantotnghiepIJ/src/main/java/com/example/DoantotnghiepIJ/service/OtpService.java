package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.Enum.OtpType;
import com.example.DoantotnghiepIJ.entity.OtpVerification;
import com.example.DoantotnghiepIJ.entity.User;
import com.example.DoantotnghiepIJ.exception.BadRequestException;
import com.example.DoantotnghiepIJ.repository.OtpVerificationRepository;
import com.example.DoantotnghiepIJ.repository.UserRepository;
import com.example.DoantotnghiepIJ.validate.UtilsValidate;
import lombok.RequiredArgsConstructor;
//import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpService {

    private  final UserRepository userRepository;
    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;

    // 🔥 SEND OTP
    public void sendOtp(String email, OtpType type) {

        UtilsValidate.validateEmail(email);
        if (type == OtpType.REGISTER && userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã tồn tại");
        }
        Optional<OtpVerification> optionalOtp =
                otpRepository.findByEmailAndOtpType(email, type);

        OtpVerification otpEntity = optionalOtp.orElse(new OtpVerification());

        // chống spam 30s
        if (otpEntity.getSentAt() != null &&
                otpEntity.getSentAt().isAfter(LocalDateTime.now().minusSeconds(30))) {

            throw new BadRequestException("Vui lòng đợi 30 giây để gửi lại OTP");
        }

        String otp = String.valueOf((int)(Math.random() * 900000) + 100000);

        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setOtpType(type);
        otpEntity.setSentAt(LocalDateTime.now());
        otpEntity.setExpiredAt(LocalDateTime.now().plusMinutes(5));

        otpRepository.save(otpEntity);

        emailService.sendOtpEmail(email, otp);
    }

    // 🔥 VERIFY OTP
    public boolean verifyOtp(String email, String otp, OtpType type) {

        Optional<OtpVerification> optionalOtp =
                otpRepository.findByEmailAndOtpType(email, type);

        if (optionalOtp.isEmpty()) return false;

        OtpVerification otpEntity = optionalOtp.get();

        if (otpEntity.getExpiredAt().isBefore(LocalDateTime.now())) return false;

        if (!otpEntity.getOtp().equals(otp.trim())) return false;

        // ✅ xóa OTP sau khi verify
        otpRepository.delete(otpEntity);

        return true;
    }
}