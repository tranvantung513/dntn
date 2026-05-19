package com.example.DoantotnghiepIJ.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/admin/discounts", "/api/v1/admin/discounts/**", "/api/v1/admin/settings/map").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/bookings").permitAll()
                        .requestMatchers(
                                "/auth/**",
                                "/api/v1/otp/**",
                                "/api/v1/cart/**",
                                "/api/payment/**",
                                "/api/orders/**",
                                "/api/chat/**",
                                "/api/menu-items/**",
                                "/api/categories/**",
                                "/api/discounts/**",
                                "/api/recommend/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // PRIVATE
                        .anyRequest().authenticated()
                )

                // 🔥 QUAN TRỌNG
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}