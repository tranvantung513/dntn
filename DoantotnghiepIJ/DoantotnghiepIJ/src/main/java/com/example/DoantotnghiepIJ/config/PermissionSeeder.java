package com.example.DoantotnghiepIJ.config;

import com.example.DoantotnghiepIJ.entity.Permission;
import com.example.DoantotnghiepIJ.repository.PermissionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class PermissionSeeder {

    private final PermissionRepository permissionRepository;

    @PostConstruct
    public void seed() {

        List<Permission> existingPermissions = permissionRepository.findAll();
        List<String> existingCodes = existingPermissions.stream()
                .map(Permission::getCode)
                .toList();

        List<Permission> permissions = List.of(

                // ORDER
                Permission.builder()
                        .code("ORDER_VIEW")
                        .name("Xem đơn")
                        .module("ORDER")
                        .description("Cho phép xem đơn hàng")
                        .build(),

                Permission.builder()
                        .code("ORDER_CREATE")
                        .name("Tạo đơn")
                        .module("ORDER")
                        .description("Cho phép tạo đơn hàng")
                        .build(),

                Permission.builder()
                        .code("ORDER_UPDATE")
                        .name("Sửa đơn")
                        .module("ORDER")
                        .description("Cho phép sửa đơn hàng")
                        .build(),

                Permission.builder()
                        .code("ORDER_DELETE")
                        .name("Xóa đơn")
                        .module("ORDER")
                        .description("Cho phép xóa đơn hàng")
                        .build(),

                // PRODUCT
                Permission.builder()
                        .code("PRODUCT_VIEW")
                        .name("Xem sản phẩm")
                        .module("PRODUCT")
                        .description("Cho phép xem sản phẩm")
                        .build(),

                Permission.builder()
                        .code("PRODUCT_CREATE")
                        .name("Tạo sản phẩm")
                        .module("PRODUCT")
                        .description("Cho phép tạo sản phẩm")
                        .build(),

                Permission.builder()
                        .code("PRODUCT_UPDATE")
                        .name("Sửa sản phẩm")
                        .module("PRODUCT")
                        .description("Cho phép sửa sản phẩm")
                        .build(),

                Permission.builder()
                        .code("PRODUCT_DELETE")
                        .name("Xóa sản phẩm")
                        .module("PRODUCT")
                        .description("Cho phép xóa sản phẩm")
                        .build(),

                // USER
                Permission.builder()
                        .code("USER_VIEW")
                        .name("Xem user")
                        .module("USER")
                        .description("Cho phép xem user")
                        .build(),

                Permission.builder()
                        .code("USER_CREATE")
                        .name("Tạo user")
                        .module("USER")
                        .description("Cho phép tạo user")
                        .build(),

                Permission.builder()
                        .code("USER_UPDATE")
                        .name("Sửa user")
                        .module("USER")
                        .description("Cho phép sửa user")
                        .build(),

                Permission.builder()
                        .code("USER_DELETE")
                        .name("Xóa user")
                        .module("USER")
                        .description("Cho phép xóa user")
                        .build(),

                //Booking
                Permission.builder()
                        .code("BOOKING_CREATE")
                        .name("Xem booking")
                        .module("BOOKING")
                        .description("Cho phép tạo booking")
                        .build(),
                Permission.builder()
                        .code("BOOKING_VIEW")
                        .name("Xem booking")
                        .module("BOOKING")
                        .description("Cho phép xem booking")
                        .build(),
                Permission.builder()
                        .code("BOOKING_UPDATE")
                        .name("Xem booking")
                        .module("BOOKING")
                        .description("Cho phép cập nhật booking")
                        .build(),
                //Category
                Permission.builder()
                        .code("CATEGORY_VIEW")
                        .name("Xem category")
                        .module("CATEGORY")
                        .description("Cho phép xem danh mục")
                        .build(),
                Permission.builder()
                        .code("CATEGORY_UPDATE")
                        .name("Xem category")
                        .module("CATEGORY")
                        .description("Cho phép cập nhật danh mục")
                        .build(),
                Permission.builder()
                        .code("CATEGORY_DELETE")
                        .name("Xem category")
                        .module("CATEGORY")
                        .description("Cho phép xóa danh mục")
                        .build(),
                Permission.builder()
                        .code("CATEGORY_CREATE")
                        .name("Xem category")
                        .module("CATEGORY")
                        .description("Cho phép tạo danh mục")
                        .build(),
                //Discount
                Permission.builder()
                        .code("DISCOUNT_VIEW")
                        .name("Xem user")
                        .module("DISCOUNT")
                        .description("Cho phép xem giảm giá")
                        .build(),
                Permission.builder()
                        .code("DISCOUNT_CREATE")
                        .name("Xem user")
                        .module("DISCOUNT")
                        .description("Cho phép tạo giảm giá")
                        .build(),
                Permission.builder()
                        .code("DISCOUNT_UPDATE")
                        .name("Xem user")
                        .module("DISCOUNT")
                        .description("Cho phép câp nhật giảm giá")
                        .build(),
                Permission.builder()
                        .code("DISCOUNT_DELETE")
                        .name("Xem user")
                        .module("DISCOUNT")
                        .description("Cho phép xoá giảm giá")
                        .build(),
                //Đặt bàn
                Permission.builder()
                        .code("TABLE_VIEW")
                        .name("Xem user")
                        .module("TABLE")
                        .description("Cho phép xem đặt bàn")
                        .build(),
                Permission.builder()
                        .code("TABLE_CREATE")
                        .name("Xem user")
                        .module("TABLE")
                        .description("Cho phép tạo đặt bàn")
                        .build(),
                Permission.builder()
                        .code("TABLE_UPDATE")
                        .name("Xem user")
                        .module("TABLE")
                        .description("Cho phép cập nhật đặt bàn")
                        .build(),
                Permission.builder()
                        .code("TABLE_DELETE")
                        .name("Xem user")
                        .module("TABLE")
                        .description("Cho phép xoá đặt bàn")
                        .build(),
                //Salary Config
                Permission.builder()
                        .code("SALARY_CONFIG_VIEW")
                        .name("Xem cấu hình lương")
                        .module("SALARY_CONFIG")
                        .description("Cho phép xem cấu hình lương")
                        .build(),
                Permission.builder()
                        .code("SALARY_CONFIG_CREATE")
                        .name("Tạo cấu hình lương")
                        .module("SALARY_CONFIG")
                        .description("Cho phép tạo cấu hình lương")
                        .build(),
                Permission.builder()
                        .code("SALARY_CONFIG_UPDATE")
                        .name("Sửa cấu hình lương")
                        .module("SALARY_CONFIG")
                        .description("Cho phép sửa cấu hình lương")
                        .build(),
                Permission.builder()
                        .code("SALARY_CONFIG_DELETE")
                        .name("Xóa cấu hình lương")
                        .module("SALARY_CONFIG")
                        .description("Cho phép xóa cấu hình lương")
                        .build()
                //Salary
                ,Permission.builder()
                        .code("SALARY_VIEW")
                        .name("Xem lương")
                        .module("SALARY")
                        .description("Cho phép xem lương")
                        .build(),
                Permission.builder()
                        .code("SALARY_UPDATE")
                        .name("Sửa lương")
                        .module("SALARY")
                        .description("Cho phép sửa lương")
                        .build(),
                Permission.builder()
                        .code("SALARY_DELETE")
                        .name("Xóa lương")
                        .module("SALARY")
                        .description("Cho phép xóa lương")
                        .build(),
                Permission.builder()
                        .code("SALARY_LOCK")
                        .name("Chốt lương")
                        .module("SALARY")
                        .description("Cho phép chốt lương")
                        .build(),
                //role
                Permission.builder()
                        .code("ROLE_VIEW")
                        .name("Xem role")
                        .module("ROLE")
                        .description("Cho phép xem role")
                        .build(),
                Permission.builder()
                        .code("ROLE_CREATE")
                        .name("Tạo role")
                        .module("ROLE")
                        .description("Cho phép tạo role")
                        .build(),
                Permission.builder()
                        .code("ROLE_UPDATE")
                        .name("Sửa role")
                        .module("ROLE")
                        .description("Cho phép sửa role")
                        .build(),
                Permission.builder()
                        .code("ROLE_DELETE")
                        .name("Xóa role")
                        .module("ROLE")
                        .description("Cho phép xóa role")
                        .build(),
                Permission.builder()
                        .code("ROLE_ASSIGN_PERMISSION")
                        .name("Phân quyền role")
                        .module("ROLE")
                        .description("Cho phép phân quyền role")
                        .build()

        );

        List<Permission> newPermissions = permissions.stream()
                .filter(p -> !existingCodes.contains(p.getCode()))
                .toList();

        if (!newPermissions.isEmpty()) {
            permissionRepository.saveAll(newPermissions);
            System.out.println("Seed thêm " + newPermissions.size() + " permission mới thành công!");
        } else {
            System.out.println("Tất cả permission đã tồn tại, không cần seed thêm.");
        }
    }
}