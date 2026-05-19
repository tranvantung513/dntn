package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.Menu.MenuItemDto;
import com.example.DoantotnghiepIJ.dto.Menu.ProductResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProductClient {

    private final RestTemplate restTemplate;

    @Value("${services.product.url}")
    private String productServiceUrl;

    public List<ProductResponse> getProducts(List<UUID> ids) {

        String url = productServiceUrl + "/api/menu-items/batch"; // public endpoint — không cần JWT

        List<MenuItemDto> menuItems = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(ids),
                new ParameterizedTypeReference<List<MenuItemDto>>() {}
        ).getBody();

        return menuItems.stream().map(item -> {
            ProductResponse p = new ProductResponse();
            p.setId(item.getId());
            p.setName(item.getName());
            p.setThumbnail(item.getThumbnail());
            p.setPrice(item.getPrice());
            p.setDiscountPrice(item.getDiscountPrice());
            return p;
        }).toList();
    }
}