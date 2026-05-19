package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.RefreshToken;
import com.example.DoantotnghiepIJ.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    //  Tìm token (dùng cho refresh)
    Optional<RefreshToken> findByToken(String token);

    //  Xóa token theo value
    void deleteByToken(String token);

    //  Lấy tất cả token active của user
    List<RefreshToken> findByUserAndRevokedFalse(User user);

    // Lấy token active + sort theo thời gian (phục vụ session limit)
    List<RefreshToken> findByUserAndRevokedFalseOrderByCreatedAtAsc(User user);

    //  Revoke tất cả token của user (logout all devices)
    List<RefreshToken> findByUser(User user);

    //  Xóa token hết hạn
    void deleteByExpiredAtBefore(LocalDateTime time);
}