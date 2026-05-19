package com.example.DoantotnghiepIJ.security;

import com.example.DoantotnghiepIJ.entity.Permission;
import com.example.DoantotnghiepIJ.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final String SECRET = "dGhpcy1pcy1hLXZlcnktc2VjdXJlLWtleS0xMjM0NTY3ODkwMTIzNDU2";

    //  KEY
    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    //  GENERATE TOKEN
    public String generateAccessToken(User user) {

        String role = user.getRole().getCode();

        List<String> permissions = user.getRole().getPermissions().stream()
                .map(Permission::getCode)
                .toList();

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId()) // 🔥 THÊM DÒNG NÀY
                .claim("role", role)
                .claim("permissions", permissions)
                .claim("type", "ACCESS")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1h
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // =========================
    //  EXTRACT DATA
    // =========================

    public Long extractUserId(String token) {
        Object userId = extractAllClaims(token).get("userId");
        return userId != null ? Long.parseLong(userId.toString()) : null;
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public List<String> extractPermissions(String token) {
        return extractAllClaims(token).get("permissions", List.class);
    }

    public String extractType(String token) {
        return extractAllClaims(token).get("type", String.class);
    }

    // =========================
    //  VALIDATE TOKEN
    // =========================

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // =========================
    // ⚙️ CORE PARSE
    // =========================

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}