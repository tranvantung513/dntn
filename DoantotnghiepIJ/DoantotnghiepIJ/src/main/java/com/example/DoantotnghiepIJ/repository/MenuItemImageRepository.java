package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.MenuItemImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MenuItemImageRepository extends JpaRepository<MenuItemImage, UUID> {
    List<MenuItemImage> findByMenuItemId(UUID menuItemId);
}