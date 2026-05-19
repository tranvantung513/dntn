package com.example.DoantotnghiepIJ.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Mã xác nhận");
        message.setText(
                "Xin chào,\n\n" +
                        "Mã OTP của bạn là: " + otp + "\n" +
                        "Mã này có hiệu lực trong 5 phút.\n\n" +
                        "Không chia sẻ mã này cho bất kỳ ai."
        );

        mailSender.send(message);
    }
}