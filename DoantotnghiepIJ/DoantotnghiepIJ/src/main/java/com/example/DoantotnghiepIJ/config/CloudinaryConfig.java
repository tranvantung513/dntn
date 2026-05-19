package com.example.DoantotnghiepIJ.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dhglh01cv",
                "api_key", "946246758227699",
                "api_secret", "s5hmJPKpJ1SQVmTb7sztq1MMMvA"
        ));
    }
}