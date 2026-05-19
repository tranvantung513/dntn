package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {

    Optional<Permission> findByCodeAndIsDeletedFalse(String code);

    List<Permission> findAllByIsDeletedFalse();

    Optional<Permission> findByIdAndIsDeletedFalse(UUID id);

    List<Permission> findAllByIsDeletedFalseOrderByModule();
}