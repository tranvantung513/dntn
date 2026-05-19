package com.example.DoantotnghiepIJ.mapper;

import com.example.DoantotnghiepIJ.dto.Menu.MenuItemDto;
import com.example.DoantotnghiepIJ.entity.MenuItem;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-25T22:20:06+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Microsoft)"
)
@Component
public class MenuItemMapperImpl implements MenuItemMapper {

    @Override
    public MenuItemDto toResponse(MenuItem menuItem) {
        if ( menuItem == null ) {
            return null;
        }

        MenuItemDto menuItemDto = new MenuItemDto();

        menuItemDto.setId( menuItem.getId() );
        menuItemDto.setThumbnail( menuItem.getThumbnail() );
        menuItemDto.setName( menuItem.getName() );
        menuItemDto.setSlug( menuItem.getSlug() );
        menuItemDto.setDescription( menuItem.getDescription() );
        menuItemDto.setPrice( menuItem.getPrice() );
        menuItemDto.setDiscountPrice( menuItem.getDiscountPrice() );
        menuItemDto.setQuantity( menuItem.getQuantity() );
        menuItemDto.setIsActive( menuItem.getIsActive() );
        menuItemDto.setIsFeatured( menuItem.getIsFeatured() );

        return menuItemDto;
    }
}
