package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.entity.Setting;
import com.example.DoantotnghiepIJ.repository.SettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingService {

    private final SettingRepository settingRepository;

    @PostConstruct
    public void initDefaultSettings() {
        if (settingRepository.count() == 0) {
            settingRepository.saveAll(List.of(
                    new Setting("store_name", "Saffron Harvest", "Tên cửa hàng"),
                    new Setting("store_description", "Thưởng thức nghệ thuật ẩm thực thượng hạng.", "Mô tả ngắn"),
                    new Setting("store_phone", "0123 456 789", "Số điện thoại liên hệ"),
                    new Setting("store_email", "contact@saffronharvest.com", "Email liên hệ"),
                    new Setting("store_address", "123 Đường Ẩm Thực, Quận 1, TP. HCM", "Địa chỉ cửa hàng"),
                    new Setting("opening_hours", "08:00 - 22:00", "Giờ mở cửa"),
                    new Setting("delivery_fee", "15000", "Phí giao hàng mặc định (VNĐ)"),
                    new Setting("facebook_url", "https://facebook.com/saffronharvest", "Link Facebook"),
                    new Setting("instagram_url", "https://instagram.com/saffronharvest", "Link Instagram")
            ));
        }
    }

    public List<Setting> getAllSettings() {
        return settingRepository.findAll();
    }

    public Map<String, String> getAllSettingsAsMap() {
        return settingRepository.findAll().stream()
                .collect(Collectors.toMap(Setting::getSettingKey, Setting::getSettingValue));
    }

    public Setting updateSetting(String key, String value) {
        Setting setting = settingRepository.findById(key)
                .orElse(new Setting(key, value, "Custom setting"));
        setting.setSettingValue(value);
        return settingRepository.save(setting);
    }

    public void updateMultipleSettings(Map<String, String> settings) {
        settings.forEach((key, value) -> {
            Setting setting = settingRepository.findById(key)
                    .orElse(new Setting(key, value, "Custom setting"));
            setting.setSettingValue(value);
            settingRepository.save(setting);
        });
    }
}
