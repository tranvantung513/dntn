package com.example.DoantotnghiepIJ.repository;

import com.example.DoantotnghiepIJ.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingRepository extends JpaRepository<Setting, String> {
}
