package com.example.DoantotnghiepIJ.controller.client;

import com.example.DoantotnghiepIJ.entity.CustomUserPrincipal;
import com.example.DoantotnghiepIJ.entity.MenuItem;
import com.example.DoantotnghiepIJ.service.RecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
public class RecommendController {

    private final RecommendService recommendService;

    @GetMapping
    public ResponseEntity<List<MenuItem>> recommend(
            Authentication authentication
    ) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserPrincipal) {
            CustomUserPrincipal user = (CustomUserPrincipal) authentication.getPrincipal();
            userId = user.getUserId();
        }

        return ResponseEntity.ok(
                recommendService.recommend(userId)
        );
    }
}