package com.example.DoantotnghiepIJ.entity;

import jakarta.persistence.*;
import lombok.*;

import com.example.DoantotnghiepIJ.Enum.Position;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "salary_config", uniqueConstraints = {
        @UniqueConstraint(columnNames = "userId")
})
public class SalaryConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Enumerated(EnumType.STRING)
    private Position position;

    private Double salaryPerHour;
}