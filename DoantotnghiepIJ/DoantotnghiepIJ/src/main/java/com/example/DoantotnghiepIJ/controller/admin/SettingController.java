package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.entity.Setting;
import com.example.DoantotnghiepIJ.service.SettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.example.DoantotnghiepIJ.service.CloudinaryService;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class SettingController {

    private final SettingService settingService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<List<Setting>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @GetMapping("/map")
    public ResponseEntity<Map<String, String>> getAllSettingsAsMap() {
        return ResponseEntity.ok(settingService.getAllSettingsAsMap());
    }

    @PutMapping
    public ResponseEntity<Void> updateSettings(@RequestBody Map<String, String> settings) {
        settingService.updateMultipleSettings(settings);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logo")
    public ResponseEntity<Map<String, String>> uploadLogo(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Map uploadResult = cloudinaryService.upload(file);
        String url = uploadResult.get("secure_url").toString();
        settingService.updateSetting("store_logo", url);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
