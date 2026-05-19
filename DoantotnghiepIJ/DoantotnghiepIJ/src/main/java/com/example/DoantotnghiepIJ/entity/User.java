package com.example.DoantotnghiepIJ.entity;

import com.example.DoantotnghiepIJ.Enum.OtpType;
import com.example.DoantotnghiepIJ.Enum.UserStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true)
    private String phone;

    @Column(unique = true)
    private String email;

    private String gender;
    private LocalDateTime dateOfBirth;

    @JsonIgnore // ẩn password
    private String passwordHash;

    private String publicId;

    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private LocalDateTime createdAt;

    private Boolean deleted;

    private LocalDateTime updatedAt;


    // TỰ ĐỘNG KHI INSERT
    @PrePersist
    public void prePersist() {
        if (publicId == null) {
            publicId = UUID.randomUUID().toString();
        }

        if (status == null) {
            status = UserStatus.ACTIVE;
        }

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (deleted == null) {
            deleted = false;
        }
    }
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;
    // TỰ ĐỘNG KHI UPDATE
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}