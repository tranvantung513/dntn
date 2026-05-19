package com.example.DoantotnghiepIJ.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "salary_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private int month;
    private int year;

    private Double totalHours;
    private Double baseSalary;

    private Double allowance;
    private Double deduction;

    private Double finalSalary;

    private Boolean isLocked;
}