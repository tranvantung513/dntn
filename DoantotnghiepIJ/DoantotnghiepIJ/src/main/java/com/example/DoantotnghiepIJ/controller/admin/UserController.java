package com.example.DoantotnghiepIJ.controller.admin;

import com.example.DoantotnghiepIJ.Enum.UserStatus;
import com.example.DoantotnghiepIJ.dto.UserDto.CreateUserDto;
import com.example.DoantotnghiepIJ.dto.UserDto.UpdateUserDto;
import com.example.DoantotnghiepIJ.dto.UserDto.UserStatisticsDto;
import com.example.DoantotnghiepIJ.entity.User;
import com.example.DoantotnghiepIJ.service.MenuItemService;
import com.example.DoantotnghiepIJ.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
@RestController
@RequestMapping("/api/v1/admin/users")
@Tag(name = "User API", description = "Quản lý user")
public class UserController {

    private final UserService userService;
    private final MenuItemService menuItemService;

    public UserController(UserService userService, MenuItemService menuItemService) {
        this.userService = userService;
        this.menuItemService = menuItemService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    public ResponseEntity<User> createUser(@RequestBody CreateUserDto request) {
        User createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @Operation(summary = "Sửa user")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @Operation(summary = "Lấy thông tin user")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @Operation(summary = "Lấy danh sách user")
    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<?> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                userService.getUsers(keyword, status, page, size)
        );
    }

    @Operation(summary = "Xóa user")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Deleted user with id: " + id);
    }

    // update status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateUserDto request
    ) {
        userService.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok("Update status success");
    }

    // statistics
    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public UserStatisticsDto getStatistics() {
        return userService.getUserStatistics();
    }

    // update role
    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @RequestBody List<String> roleCodes
    ) {
        userService.updateUserRole(userId, roleCodes.get(0));
        return ResponseEntity.ok("Update role success");
    }
}
