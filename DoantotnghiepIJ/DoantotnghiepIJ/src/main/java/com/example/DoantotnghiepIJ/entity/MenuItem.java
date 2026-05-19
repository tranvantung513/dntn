package com.example.DoantotnghiepIJ.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "menu_items",
        indexes = {
                @Index(name = "idx_menu_name", columnList = "name"),
                @Index(name = "idx_menu_slug", columnList = "slug")
        }
)
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String slug;

    private String description;

    @Column(nullable = false)
    private Double price;

    private Double discountPrice;
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    private Boolean isAvailable;
//    @ManyToOne
//    @JoinColumn(name = "category_id")
//    private Category category;
    private Boolean isCombo;
    @Column(name = "is_active")
    private Boolean isActive = true;
    private Boolean isDeleted = false;
    private String thumbnail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Column(nullable = false)
    private Integer quantity = 0;
    //  CATEGORY
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)

    private Category category;

    // AUTO
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (isAvailable == null) isAvailable = true;
        if (isCombo == null) isCombo = false;
        if (isDeleted == null) isDeleted = false;
        if (isActive == null) isActive = true;
        if (quantity == null) quantity = 0;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}