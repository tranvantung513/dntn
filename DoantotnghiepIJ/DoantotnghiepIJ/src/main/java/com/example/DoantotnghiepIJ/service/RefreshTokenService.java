package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.entity.RefreshToken;
import com.example.DoantotnghiepIJ.entity.User;
import com.example.DoantotnghiepIJ.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    private static final int MAX_SESSIONS = 5;

    public String createRefreshToken(User user, String userAgent, String ipAddress) {

        // 1. Giới hạn session
        List<RefreshToken> tokens = refreshTokenRepository
                .findByUserAndRevokedFalseOrderByCreatedAtAsc(user);

        if (tokens.size() >= MAX_SESSIONS) {
            RefreshToken oldest = tokens.get(0);
            oldest.setRevoked(true);
            refreshTokenRepository.save(oldest);
        }

        // 2. Tạo token mạnh hơn
        String token = UUID.randomUUID().toString() + UUID.randomUUID();

        // 3. Tạo entity
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .expiredAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return token;
    }
}
