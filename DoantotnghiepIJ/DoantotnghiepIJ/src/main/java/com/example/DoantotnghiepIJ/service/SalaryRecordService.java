package com.example.DoantotnghiepIJ.service;

import com.example.DoantotnghiepIJ.dto.SalaryRecord.*;
import com.example.DoantotnghiepIJ.entity.*;
import com.example.DoantotnghiepIJ.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Pageable;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryRecordService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final SalaryConfigRepository salaryConfigRepository;
    private final SalaryRecordRepository salaryRecordRepository;

    // ================= GET =================
    public Page<SalaryRecordResponse> getSalaries(int month, int year, Pageable pageable) {

        Page<User> users = userRepository.findAll(pageable);

        return users.map(user -> {

            double totalHours = attendanceRepository
                    .sumWorkingHours(user.getId(), month, year);

            Double salaryPerHour = salaryConfigRepository
                    .getSalaryByUserId(user.getId());

            if (salaryPerHour == null) salaryPerHour = 0.0;

            double baseSalary = totalHours * salaryPerHour;

            SalaryRecord record = salaryRecordRepository
                    .findByUserIdAndMonthAndYear(user.getId(), month, year)
                    .orElse(null);

            double allowance = (record != null && record.getAllowance() != null)
                    ? record.getAllowance() : 0;

            double deduction = (record != null && record.getDeduction() != null)
                    ? record.getDeduction() : 0;

            double finalSalary = baseSalary + allowance - deduction;

            Boolean isLocked = record != null && Boolean.TRUE.equals(record.getIsLocked());

            return SalaryRecordResponse.builder()
                    .userId(user.getId())
                    .name(user.getFullName())
                    .totalHours(totalHours)
                    .salaryPerHour(salaryPerHour)
                    .baseSalary(baseSalary)
                    .allowance(allowance)
                    .deduction(deduction)
                    .finalSalary(finalSalary)
                    .isLocked(isLocked)
                    .build();
        });
    }

    // ================= UPDATE =================
    public void updateSalary(Long userId, int month, int year, SalaryUpdateRequest request) {

        SalaryRecord record = salaryRecordRepository
                .findByUserIdAndMonthAndYear(userId, month, year)
                .orElseGet(() -> SalaryRecord.builder()
                        .userId(userId)
                        .month(month)
                        .year(year)
                        .build());

        if (Boolean.TRUE.equals(record.getIsLocked())) {
            throw new RuntimeException("Đã chốt lương!");
        }

        record.setAllowance(request.getAllowance() != null ? request.getAllowance() : 0);
        record.setDeduction(request.getDeduction() != null ? request.getDeduction() : 0);

        salaryRecordRepository.save(record);
    }

    // ================= DELETE =================
    public void deleteSalary(Long userId, int month, int year) {
        salaryRecordRepository.deleteByUserIdAndMonthAndYear(userId, month, year);
    }

    // ================= LOCK =================
    public void lockSalary(int month, int year) {

        List<User> users = userRepository.findAll();

        for (User user : users) {

            double totalHours = attendanceRepository
                    .sumWorkingHours(user.getId(), month, year);

            Double salaryPerHour = salaryConfigRepository
                    .getSalaryByUserId(user.getId());

            if (salaryPerHour == null) salaryPerHour = 0.0;

            double baseSalary = totalHours * salaryPerHour;

            SalaryRecord record = salaryRecordRepository
                    .findByUserIdAndMonthAndYear(user.getId(), month, year)
                    .orElse(new SalaryRecord());

            double allowance = record.getAllowance() != null ? record.getAllowance() : 0;
            double deduction = record.getDeduction() != null ? record.getDeduction() : 0;

            double finalSalary = baseSalary + allowance - deduction;

            record.setUserId(user.getId());
            record.setMonth(month);
            record.setYear(year);

            record.setTotalHours(totalHours);
            record.setBaseSalary(baseSalary);
            record.setFinalSalary(finalSalary);

            record.setIsLocked(true);

            salaryRecordRepository.save(record);
        }
    }

    public ByteArrayInputStream exportExcel(int month, int year) {

        List<SalaryRecordResponse> data =
                getSalaries(month, year, Pageable.unpaged()).getContent();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("BangLuong");

            // ================= STYLE =================
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setFont(titleFont);

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorder(headerStyle);

            CellStyle borderStyle = workbook.createCellStyle();
            setBorder(borderStyle);

            CellStyle moneyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            moneyStyle.setDataFormat(format.getFormat("#,##0 \"VND\""));
            moneyStyle.setAlignment(HorizontalAlignment.RIGHT);
            setBorder(moneyStyle);

            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setAlignment(HorizontalAlignment.CENTER);
            setBorder(centerStyle);

            // ================= TITLE =================
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("BẢNG LƯƠNG THÁNG " + month + "/" + year);
            titleCell.setCellStyle(titleStyle);

            // 👉 còn 9 cột (0 → 8)
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 8));

            // ================= HEADER =================
            String[] columns = {
                    "STT", "User ID", "Tên", "Giờ làm", "Lương/giờ",
                    "Lương cơ bản", "Phụ cấp", "Khấu trừ", "Lương cuối"
            };

            Row headerRow = sheet.createRow(2);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // ================= DATA =================
            int rowIdx = 3;
            int stt = 1;

            for (SalaryRecordResponse item : data) {
                Row row = sheet.createRow(rowIdx++);

                createCell(row, 0, stt++, centerStyle); // STT
                createCell(row, 1, item.getUserId(), borderStyle);
                createCell(row, 2, item.getName(), borderStyle);
                createCell(row, 3, item.getTotalHours(), borderStyle);
                createCell(row, 4, item.getSalaryPerHour(), moneyStyle);
                createCell(row, 5, item.getBaseSalary(), moneyStyle);
                createCell(row, 6, item.getAllowance(), moneyStyle);
                createCell(row, 7, item.getDeduction(), moneyStyle);
                createCell(row, 8, item.getFinalSalary(), moneyStyle);
            }

            // ================= TOTAL =================
            Row totalRow = sheet.createRow(rowIdx);

            totalRow.createCell(7).setCellValue("TỔNG:");

            double totalAll = data.stream()
                    .mapToDouble(SalaryRecordResponse::getFinalSalary)
                    .sum();

            createCell(totalRow, 8, totalAll, moneyStyle);

            // ================= AUTO SIZE =================
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // 👉 Ẩn User ID
            sheet.setColumnHidden(1, true);

            // Freeze header
            sheet.createFreezePane(0, 3);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Lỗi export Excel", e);
        }
    }
//    helper methods
    private void setBorder(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void createCell(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);

        if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else {
            cell.setCellValue(value != null ? value.toString() : "");
        }

        cell.setCellStyle(style);
    }
}