package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.Enum.UserStatus;
import com.example.DoantotnghiepIJ.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmailAndDeletedFalse(String email);
    boolean existsByEmail(String email);
    Optional<User> findByPublicId(String publicId);
    long countByStatus(UserStatus status);

    @Query("SELECT COUNT(u) FROM User u WHERE DATE(u.createdAt) = :today")
    long countUsersCreatedToday(LocalDate today);
    @Query("""
    SELECT u FROM User u
    WHERE 
        u.deleted = false
        AND (   
            :keyword IS NULL OR
            LOWER(u.fullName) LIKE %:keyword% OR
            LOWER(u.email) LIKE %:keyword% OR
            u.phone LIKE %:keyword%
        )
        AND (
            :status IS NULL OR u.status = :status
        )
""")
    Page<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("status") UserStatus status,
            Pageable pageable
    );
}