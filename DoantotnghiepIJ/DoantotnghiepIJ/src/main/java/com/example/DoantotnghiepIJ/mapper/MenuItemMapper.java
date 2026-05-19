package com.example.DoantotnghiepIJ.mapper;

import com.example.DoantotnghiepIJ.dto.Menu.MenuItemDto;
import com.example.DoantotnghiepIJ.entity.MenuItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MenuItemMapper {
    MenuItemDto toResponse(MenuItem menuItem);
}