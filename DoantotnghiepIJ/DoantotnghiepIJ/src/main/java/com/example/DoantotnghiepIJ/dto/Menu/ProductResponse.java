package com.example.DoantotnghiepIJ.dto.Menu;



import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ProductResponse {

    private UUID id;
    private String name;
    private String thumbnail;

    private Double price;
    private Double discountPrice;
}