package com.example.DoantotnghiepIJ.security;

import com.example.DoantotnghiepIJ.entity.CustomUserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        try {
            if (!jwtService.isTokenValid(jwt)) {
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                String email = jwtService.extractUsername(jwt);
                Long userId = jwtService.extractUserId(jwt);
                String role = jwtService.extractRole(jwt);
                List<String> permissions = jwtService.extractPermissions(jwt);

                // 🔥 FIX Ở ĐÂY
                List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();

                // 👉 ROLE (bắt buộc phải có prefix ROLE_)
                String roleAuthority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
                authorities.add(new SimpleGrantedAuthority(roleAuthority));

                // 👉 PERMISSIONS
                if (permissions != null) {
                    authorities.addAll(
                            permissions.stream()
                                    .map(SimpleGrantedAuthority::new)
                                    .toList()
                    );
                }

                CustomUserPrincipal principal =
                        new CustomUserPrincipal(userId, email, role);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                authorities
                        );

                SecurityContextHolder.getContext().setAuthentication(authToken);

                // 🔥 Set userId vao request attribute de controller co the dung
                request.setAttribute("userId", userId);
            }

        } catch (Exception e) {
            e.printStackTrace(); // debug nếu cần
        }

        filterChain.doFilter(request, response);
    }
}