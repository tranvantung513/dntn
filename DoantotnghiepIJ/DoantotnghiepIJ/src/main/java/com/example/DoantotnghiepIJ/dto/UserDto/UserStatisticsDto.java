package com.example.DoantotnghiepIJ.dto.UserDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserStatisticsDto {
    private long totalUsers;
    private long newUsersToday;
    private long activeUsers;
}